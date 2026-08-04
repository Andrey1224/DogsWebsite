import { test, expect } from '@playwright/test';
import { presetConsent } from './helpers/consent';

test.beforeEach(async ({ page }) => {
  // Not exercising consent behavior here — preset it so the banner never blocks assertions.
  await presetConsent(page, 'granted');
});

test('home page highlights core pillars', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: /french & english bulldog puppies available in falkville, alabama/i,
    }),
  ).toBeVisible();

  await expect(page.getByText(/AKC pedigrees, OFA screenings/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /view available puppies/i }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /health-first standards/i })).toBeVisible();
});

test('missing puppy pages return a real 404 response', async ({ page }) => {
  const response = await page.goto('/puppies/seo-missing-puppy');

  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /oops! this pup ran off/i })).toBeVisible();
});
