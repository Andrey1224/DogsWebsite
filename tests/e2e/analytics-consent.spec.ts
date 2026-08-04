import { test, expect } from '@playwright/test';
import './types';
import { acceptConsent, getConsentButton, getStoredConsent } from './helpers/consent';

test.describe('Analytics consent mode', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('GA script loads before any consent decision, with no analytics/ad cookies set yet', async ({
    page,
  }) => {
    const gaRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('googletagmanager.com/gtag/js')) gaRequests.push(req.url());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(gaRequests.length).toBeGreaterThan(0);

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === '_ga' || c.name === '_gid')).toBeUndefined();
    expect(cookies.find((c) => c.name === '_fbp' || c.name === '_fbc')).toBeUndefined();
  });

  test('Meta script is never requested before consent', async ({ page }) => {
    const metaRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('facebook.net')) metaRequests.push(req.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(metaRequests).toHaveLength(0);
  });

  test('GA bootstrap order: consent default -> js -> config(send_page_view:false) -> manual page_view', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const dataLayer = await page.evaluate(() => window.dataLayer ?? []);
    const findIndex = (predicate: (entry: unknown[]) => boolean) =>
      dataLayer.findIndex((entry) => predicate(entry as unknown[]));

    const consentDefaultIndex = findIndex((e) => e[0] === 'consent' && e[1] === 'default');
    const jsIndex = findIndex((e) => e[0] === 'js');
    const configIndex = findIndex((e) => e[0] === 'config');
    const pageViewIndex = findIndex((e) => e[0] === 'event' && e[1] === 'page_view');

    expect(consentDefaultIndex).toBeGreaterThanOrEqual(0);
    expect(jsIndex).toBeGreaterThan(consentDefaultIndex);
    expect(configIndex).toBeGreaterThan(jsIndex);
    expect(pageViewIndex).toBeGreaterThan(configIndex);

    const configEntry = dataLayer[configIndex] as unknown[];
    expect(configEntry[2]).toMatchObject({ send_page_view: false });
  });

  test('after Accept: consent persists as granted, Google consent updates to granted, Meta script loads, exactly one PageView', async ({
    page,
  }) => {
    const metaScriptRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('facebook.net/en_US/fbevents.js')) metaScriptRequests.push(req.url());
    });

    await page.goto('/');
    await acceptConsent(page);

    await expect
      .poll(async () => {
        const cookies = await page.context().cookies();
        return cookies.find((c) => c.name === 'exoticbulldoglegacy_consent')?.value;
      })
      .toBe('granted');

    await expect.poll(() => metaScriptRequests.length, { timeout: 10_000 }).toBeGreaterThan(0);

    const dataLayer = await page.evaluate(() => window.dataLayer ?? []);
    const consentUpdateGranted = (dataLayer as unknown[][]).find(
      (e) =>
        e[0] === 'consent' &&
        e[1] === 'update' &&
        (e[2] as Record<string, unknown> | undefined)?.analytics_storage === 'granted',
    );
    expect(consentUpdateGranted).toBeTruthy();

    const pageViewCount = (dataLayer as unknown[][]).filter(
      (e) => e[0] === 'event' && e[1] === 'page_view',
    ).length;
    expect(pageViewCount).toBe(1);
  });

  test('after Decline: Google stays cookieless (no _ga/_gid cookies), Meta fully blocked (no script, no API call)', async ({
    page,
  }) => {
    const metaRequests: string[] = [];
    const metaApiRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('facebook.net')) metaRequests.push(req.url());
      if (req.url().includes('/api/analytics/meta')) metaApiRequests.push(req.url());
    });

    await page.goto('/');

    const button = page.getByRole('button', { name: /decline/i }).first();
    await button.waitFor({ state: 'visible', timeout: 10_000 });

    await expect(async () => {
      await button.evaluate((node) => (node as HTMLElement).click());
      const consent = await page.evaluate(() =>
        window.localStorage.getItem('exoticbulldoglegacy-consent'),
      );
      expect(consent).toBe('denied');
    }).toPass({ timeout: 15_000 });

    // Give any (incorrect) deferred script loads a chance to fire before asserting absence.
    await page.waitForTimeout(1_000);

    const cookies = await page.context().cookies();
    expect(cookies.some((c) => c.name.startsWith('_ga'))).toBe(false);
    expect(cookies.some((c) => c.name === '_fbp' || c.name === '_fbc')).toBe(false);
    expect(metaRequests).toHaveLength(0);
    expect(metaApiRequests).toHaveLength(0);
  });

  test('Privacy settings resets stored consent and reopens the banner without a full page reload', async ({
    page,
  }) => {
    await page.goto('/');
    await acceptConsent(page);

    const privacyButton = page.getByRole('button', { name: /privacy settings/i });
    await privacyButton.scrollIntoViewIfNeeded();
    await privacyButton.click();

    await expect.poll(async () => getStoredConsent(page)).toBeNull();
    await expect(getConsentButton(page)).toBeVisible({ timeout: 5_000 });
  });
});
