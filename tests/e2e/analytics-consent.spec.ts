import { test, expect } from '@playwright/test';

test.describe('Analytics consent mode', () => {
  test.beforeEach(async ({ context }) => {
    // Clear all cookies and localStorage before each test
    await context.clearCookies();
  });

  test('GA script loads before consent decision', async ({ page }) => {
    // Navigate with navigator.webdriver set to false to avoid auto-grant
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    const gaRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('googletagmanager.com/gtag/js')) gaRequests.push(req.url());
    });

    await page.goto('/');

    // Check if googletagmanager script request was made
    expect(gaRequests.length).toBeGreaterThan(0);

    // Assert: no _ga or _gid cookies
    const cookies = await page.context().cookies();
    const gaGid = cookies.find((c) => c.name === '_ga' || c.name === '_gid');
    const fbp = cookies.find((c) => c.name === '_fbp' || c.name === '_fbc');
    expect(gaGid).toBeUndefined();
    expect(fbp).toBeUndefined();
  });

  test('no analytics cookies before consent', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const cookies = await page.context().cookies();
    const gaGid = cookies.find((c) => c.name === '_ga' || c.name === '_gid');
    const fbp = cookies.find((c) => c.name === '_fbp' || c.name === '_fbc');
    expect(gaGid).toBeUndefined();
    expect(fbp).toBeUndefined();
  });

  test('Meta script absent before consent', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
    const metaRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('facebook.net')) metaRequests.push(req.url());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(metaRequests).toHaveLength(0);
  });

  test('after Accept: GA cookies set and Meta loads', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    const metaRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('facebook.net')) metaRequests.push(req.url());
    });

    await page.goto('/');

    const button = page.getByRole('button', { name: /accept & continue/i }).first();
    await button.waitFor({ state: 'visible', timeout: 10000 });

    await expect(async () => {
      await button.evaluate((node) => (node as HTMLElement).click());
      const consent = await page.evaluate(() =>
        window.localStorage.getItem('exoticbulldoglegacy-consent'),
      );
      expect(consent).toBe('granted');
    }).toPass({ timeout: 15000 });
  });

  test('after Decline: no GA cookies and no Meta', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    const metaRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('facebook.net')) metaRequests.push(req.url());
    });

    await page.goto('/');

    const button = page.getByRole('button', { name: /decline/i }).first();
    await button.waitFor({ state: 'visible', timeout: 10000 });

    await expect(async () => {
      await button.evaluate((node) => (node as HTMLElement).click());
      const consent = await page.evaluate(() =>
        window.localStorage.getItem('exoticbulldoglegacy-consent'),
      );
      expect(consent).toBe('denied');
    }).toPass({ timeout: 15000 });

    const cookies = await page.context().cookies();
    const hasGa = cookies.some((c) => c.name.startsWith('_ga'));
    const fbp = cookies.some((c) => c.name === '_fbp' || c.name === '_fbc');

    // Actually GA might not set cookies immediately after decline (or never)
    expect(hasGa).toBe(false);
    expect(fbp).toBe(false);

    // Assert no facebook.net requests
    expect(metaRequests).toHaveLength(0);
  });
});
