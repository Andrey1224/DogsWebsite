import { expect, type Page } from '@playwright/test';

const CONSENT_STORAGE_KEY = 'exoticbulldoglegacy-consent';

export function getConsentButton(page: Page) {
  return page.getByRole('button', { name: /accept & continue/i }).first();
}

/**
 * Pre-seeds the consent choice in localStorage before any navigation, so the consent
 * banner never renders for tests that aren't exercising consent behavior itself. The site
 * no longer auto-grants consent for automated browsers, so tests that don't care about
 * analytics/consent must opt out explicitly — either via this helper, by clicking
 * Accept/Decline, or by asserting on the banner directly.
 */
export async function presetConsent(page: Page, value: 'granted' | 'denied') {
  await page.addInitScript(
    ({ key, value: consentValue }) => {
      window.localStorage.setItem(key, consentValue);
    },
    { key: CONSENT_STORAGE_KEY, value },
  );
}

export async function getStoredConsent(page: Page) {
  return page.evaluate((key) => window.localStorage.getItem(key), CONSENT_STORAGE_KEY);
}

/**
 * Accepts the consent banner if visible, with proper waiting and validation.
 * This helper handles:
 * - Waiting for banner to appear (with timeout for already-accepted case)
 * - Clicking accept button
 * - Waiting for banner to fully disappear
 * - Validating consent persisted to localStorage
 */
export async function acceptConsent(page: Page) {
  const button = getConsentButton(page);

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
