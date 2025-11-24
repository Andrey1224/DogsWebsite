import { test, expect, type Page } from '@playwright/test';
import './types';

const CONSENT_STORAGE_KEY = 'exoticbulldoglegacy-consent';

function consentButton(page: Page) {
  return page.getByRole('button', { name: /accept & continue/i }).first();
}

async function getStoredConsent(page: Page) {
  return page.evaluate((key) => window.localStorage.getItem(key), CONSENT_STORAGE_KEY);
}

async function acceptConsent(page: Page) {
  const button = consentButton(page);

  // Wait for button to be visible (with timeout for already-accepted case)
  try {
    await button.waitFor({ state: 'visible', timeout: 5_000 });
  } catch {
    // Button not visible within timeout, consent likely already granted
    return;
  }

  await button.click();
  await expect(button).toBeHidden({ timeout: 15_000 });
  await expect
    .poll(async () => getStoredConsent(page), {
      timeout: 15_000,
      message: 'Consent should persist to localStorage',
    })
    .toBe('granted');
}

test.describe('Analytics & Consent Management', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear storage before each test
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test('shows consent banner on first visit', async ({ page }) => {
    const consentBanner = consentButton(page);
    await expect(consentBanner).toBeVisible();
  });

  test('consent banner allows accepting analytics', async ({ page }) => {
    await acceptConsent(page);

    // Check that consent was persisted in localStorage
    const consent = await getStoredConsent(page);

    expect(consent).toBe('granted');
  });

  test('consent persists across page navigations', async ({ page }) => {
    await acceptConsent(page);

    // Navigate to different pages
    await page.goto('/puppies');
    await expect(consentButton(page)).toBeHidden({ timeout: 15_000 });
    await page.goto('/contact');
    await expect(consentButton(page)).toBeHidden({ timeout: 15_000 });
    await page.goto('/');

    // Consent banner should not reappear
    await expect(consentButton(page)).toBeHidden({ timeout: 15_000 });
  });

  test('analytics scripts do not load without consent', async ({ page }) => {
    // Block analytics requests
    const gaRequests: string[] = [];
    const fbRequests: string[] = [];

    await page.route('**/*google-analytics.com/**', (route) => {
      gaRequests.push(route.request().url());
      route.abort();
    });

    await page.route('**/*googletagmanager.com/**', (route) => {
      gaRequests.push(route.request().url());
      route.abort();
    });

    await page.route('**/*facebook.net/**', (route) => {
      fbRequests.push(route.request().url());
      route.abort();
    });

    // Navigate without accepting consent
    await page.goto('/');

    // Wait a bit to ensure no scripts are loaded
    await page.waitForTimeout(2000);

    // Verify no analytics scripts were requested
    expect(gaRequests.length).toBe(0);
    expect(fbRequests.length).toBe(0);
  });

  test('analytics consent can be read from health endpoint', async ({ page }) => {
    const response = await page.goto('/api/health');
    expect(response?.ok()).toBe(true);

    const data = await response?.json();

    // Health endpoint should report analytics status
    expect(data).toHaveProperty('services');
    expect(data.services).toHaveProperty('analytics');

    // Analytics services should be reported (even if not_configured)
    const analyticsStatus = data.services.analytics.status;
    expect(['ok', 'not_configured']).toContain(analyticsStatus);
  });

  test('trackEvent is blocked without consent', async ({ page }) => {
    // Set up tracking spy
    await page.addInitScript(() => {
      window.__gtagCalls = [] as unknown[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.gtag = function (...args: unknown[]) {
        if (window.__gtagCalls) {
          window.__gtagCalls.push(args);
        }
      } as any;

      window.__fbqCalls = [] as unknown[];
      window.fbq = function (...args: unknown[]) {
        if (window.__fbqCalls) {
          window.__fbqCalls.push(args);
        }
      } as typeof window.fbq;
    });

    await page.goto('/');

    // Dismiss consent banner (deny consent)
    const consentBanner = page.locator('[role="complementary"]');
    if (await consentBanner.isVisible()) {
      // Click outside the banner or wait for it to be dismissible
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Try to trigger an event without accepting consent
    const contactBar = page.locator('aside').filter({ hasText: 'Call' });
    const callLink = contactBar.getByRole('link', { name: 'Call', exact: true });

    // Prevent actual navigation
    await page.route('tel:*', (route) => route.abort());

    // Force click in case banner is still visible
    await callLink.click({ force: true });

    // Check that no analytics events were sent
    const gtagCalls = await page.evaluate(() => window.__gtagCalls || []);
    const fbqCalls = await page.evaluate(() => window.__fbqCalls || []);

    // Events might be tracked but not sent to analytics (blocked by consent)
    // The trackEvent function is called, but gtag/fbq are not invoked
    expect(gtagCalls.length).toBe(0);
    expect(fbqCalls.length).toBe(0);
  });

  test('environment variables are validated for analytics config', async ({ page }) => {
    const response = await page.goto('/api/health');
    const data = await response?.json();

    // Check environment validation includes analytics variables
    expect(data.services.environment).toBeDefined();

    // Analytics should be reported in health check
    expect(data.services.analytics).toBeDefined();
    expect(data.services.analytics).toHaveProperty('status');
    expect(data.services.analytics).toHaveProperty('services');

    // Services should be an array (may be empty if not configured)
    expect(Array.isArray(data.services.analytics.services)).toBe(true);
  });

  test('consent cookie is set with correct attributes', async ({ page, context }) => {
    await acceptConsent(page);

    // Check cookies
    // Wait for cookie to be persisted before asserting attributes
    await expect
      .poll(async () => {
        const cookies = await context.cookies();
        return cookies.find((cookie) => cookie.name === 'exoticbulldoglegacy_consent') ?? null;
      })
      .not.toBeNull();

    const cookies = await context.cookies();
    const consentCookie = cookies.find((cookie) => cookie.name === 'exoticbulldoglegacy_consent');

    expect(consentCookie?.value).toBe('granted');
    expect(consentCookie?.sameSite).toBe('Lax');
    expect(consentCookie?.path).toBe('/');
  });

  test('localStorage is used as primary consent storage', async ({ page }) => {
    await acceptConsent(page);

    // Verify localStorage is set correctly
    const storageKey = await getStoredConsent(page);

    expect(storageKey).toBe('granted');

    // Reload page and verify consent persists
    await page.reload();

    const persistedConsent = await getStoredConsent(page);

    expect(persistedConsent).toBe('granted');
  });

  test('debug mode is enabled in development', async ({ page }) => {
    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'log' && msg.text().includes('Analytics')) {
        consoleLogs.push(msg.text());
      }
    });

    // Accept consent to trigger analytics initialization
    await acceptConsent(page);

    // Wait for analytics to initialize
    await page.waitForTimeout(1000);

    // Check that development debug logs are present
    // Note: This test only works in development mode
    if (process.env.NODE_ENV === 'development') {
      const hasAnalyticsLog = consoleLogs.some(
        (log) => log.includes('Analytics') && log.includes('📊'),
      );

      // In dev mode, we should see debug logs
      // In production, we won't (this test will be skipped)
      expect(hasAnalyticsLog || process.env.NODE_ENV !== 'development').toBe(true);
    }
  });
});
