import { test, expect } from '@playwright/test';

const SHOULD_MOCK_RESERVATION = process.env.PLAYWRIGHT_MOCK_RESERVATION === 'true';

test.describe('Reservation flow', () => {
  test.skip(
    !SHOULD_MOCK_RESERVATION,
    'Requires PLAYWRIGHT_MOCK_RESERVATION=true to avoid real Stripe interactions',
  );

  test('user selects a puppy and reaches mocked checkout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const viewPuppiesCta = page.getByRole('link', { name: /view available puppies/i }).first();
    await viewPuppiesCta.click();
    await page.waitForURL('**/puppies**', { waitUntil: 'domcontentloaded' });

    const cards = page.locator('[data-testid="puppy-card"]');
    const cardCount = await cards.count();
    test.skip(cardCount === 0, 'No puppies available to reserve');

    const firstCard = cards.first();
    const detailsLink = firstCard.getByRole('link', { name: /view details/i });
    await detailsLink.click();
    await page.waitForLoadState('networkidle');

    const reserveButton = page.getByRole('button', {
      name: /reserve with/i,
    });
    await reserveButton.waitFor({ state: 'visible', timeout: 15_000 });

    await reserveButton.click();

    await page.waitForURL('**/mock-checkout**', { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /mock checkout session/i })).toBeVisible();
    await expect(page.getByText(/Playwright reservation scenario stops here/i)).toBeVisible();
  });
});
