import { expect, type Page } from '@playwright/test';

const CONSENT_STORAGE_KEY = 'exoticbulldoglegacy-consent';

export function getConsentButton(page: Page) {
  return page.getByRole('button', { name: /accept & continue/i }).first();
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
