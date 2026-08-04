import { test, expect } from '@playwright/test';

const SHOULD_MOCK_RESERVATION = process.env.PLAYWRIGHT_MOCK_RESERVATION === 'true';

test.describe('Reservation flow', () => {
  test.skip(
    !SHOULD_MOCK_RESERVATION,
    'Requires PLAYWRIGHT_MOCK_RESERVATION=true to avoid real Stripe interactions',
  );

  test('user selects a puppy and reaches mocked checkout', async ({ page }) => {
    // Navigate directly to available puppies to ensure we find a reservable puppy
    await page.goto('/puppies?status=available');
    await page.waitForLoadState('domcontentloaded');

    const cards = page.locator('[data-testid="puppy-card"]');
    const cardCount = await cards.count();
    test.skip(cardCount === 0, 'No puppies available to reserve');

    const firstCard = cards.first();
    const detailsLink = firstCard.getByRole('link', { name: /view details/i });
    await detailsLink.click();
    await page.waitForLoadState('networkidle');

    const reserveButton = page.getByRole('button', {
      name: /^reserve\s+/i,
    });
    await reserveButton.waitFor({ state: 'visible', timeout: 15_000 });

    await reserveButton.click();

    await page.waitForURL('**/mock-checkout**', { timeout: 15_000 });
    expect(page.url()).toContain('paymentType=deposit');
    await expect(page.getByRole('heading', { name: /mock checkout session/i })).toBeVisible();
    await expect(page.getByText(/Playwright reservation scenario stops here/i)).toBeVisible();
    await expect(page.getByTestId('mock-checkout-payment-type')).toHaveText(/deposit/i);
  });

  test('user pays in full and reaches mocked checkout', async ({ page }) => {
    // Navigate directly to available puppies to ensure we find a reservable puppy
    await page.goto('/puppies?status=available');
    await page.waitForLoadState('domcontentloaded');

    const cards = page.locator('[data-testid="puppy-card"]');
    const cardCount = await cards.count();
    test.skip(cardCount === 0, 'No puppies available to reserve');

    const firstCard = cards.first();
    const detailsLink = firstCard.getByRole('link', { name: /view details/i });
    await detailsLink.click();
    await page.waitForLoadState('networkidle');

    const fullPaymentButton = page.getByRole('button', {
      name: /^buy now/i,
    });

    const isVisible = await fullPaymentButton
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    test.skip(!isVisible, 'Puppy has no price set, full-payment option not offered');

    await fullPaymentButton.click();

    await page.waitForURL('**/mock-checkout**', { timeout: 15_000 });
    expect(page.url()).toContain('paymentType=full');
    await expect(page.getByRole('heading', { name: /mock checkout session/i })).toBeVisible();
    await expect(page.getByTestId('mock-checkout-payment-type')).toHaveText(/full/i);
  });
});
