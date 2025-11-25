import { test, expect } from '@playwright/test';

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
