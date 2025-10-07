import { test, expect } from "@playwright/test";

test("home page highlights core pillars", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /coming soon: a trusted home/i,
    }),
  ).toBeVisible();

  await expect(page.getByText(/Stripe and PayPal deposits lock in your pick/i)).toBeVisible();
  await expect(page.getByText(/Sprint 0 is focused on infrastructure/i)).toBeVisible();
});
