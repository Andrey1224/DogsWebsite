import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { acceptConsent } from './helpers/consent';

test('filters puppies by status and breed', async ({ page }) => {
  await page.goto('/puppies');
  await page.waitForLoadState('networkidle');
  await acceptConsent(page);

  const statusSelect = page.getByLabel(/Status/i);
  await statusSelect.waitFor({ state: 'visible', timeout: 15_000 });

  // Wait a bit for any client-side hydration to complete
  await page.waitForTimeout(500);

  await statusSelect.selectOption('available');
  // Wait for URL to update after status selection (client-side routing with polling)
  await expect.poll(async () => page.url(), { timeout: 10_000 }).toMatch(/status=available/);

  // Wait for component to fully re-render after status change
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Re-fetch breed select after status filter update to get fresh locator
  const breedSelect = page.getByLabel(/Breed/i);
  await breedSelect.waitFor({ state: 'visible', timeout: 15_000 });

  await breedSelect.selectOption('french_bulldog');
  // Wait for URL to update after breed selection (client-side routing with polling)
  await expect.poll(async () => page.url(), { timeout: 10_000 }).toMatch(/breed=french_bulldog/);

  await expect(breedSelect).toHaveValue('french_bulldog');
  await expect(page).toHaveURL(/breed=french_bulldog/);

  const cards = page.locator('[data-testid="puppy-card"]');
  const cardCount = await cards.count();

  if (cardCount > 0) {
    await expect(cards.first()).toBeVisible();
  } else {
    await expect(
      page.getByText(/No puppies match the selected filters/i, { exact: false }),
    ).toBeVisible();
  }
});

test('submits contact inquiry with captcha bypass', async ({ page }) => {
  test.skip(
    !process.env.NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN,
    'Requires NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN for automated submission',
  );

  await page.goto('/contact');
  await page.waitForLoadState('domcontentloaded');
  await acceptConsent(page);

  await page.getByLabel(/Your name/i).fill('Playwright Tester');
  const uniqueEmail = `playwright+${randomUUID()}@example.com`;
  await page.getByRole('textbox', { name: /Email/i }).fill(uniqueEmail);
  await page.getByLabel(/Phone/i).fill('+1 205 555 9999');
  await page
    .getByLabel(/How can we help\?/i)
    .fill('Interested in Marcel and available delivery options for next month.');

  await page.getByRole('button', { name: /share my inquiry/i }).click();

  // Dark variant shows "Inquiry Received!" and replaces the entire form
  await expect(page.getByText(/Inquiry Received!/i)).toBeVisible({
    timeout: 15_000,
  });
});
