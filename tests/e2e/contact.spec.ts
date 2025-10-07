import { test, expect } from "@playwright/test";

test("filters puppies by status and breed", async ({ page }) => {
  await page.goto("/puppies");

  await page.getByLabel(/Status/i).selectOption("available");
  await page.getByLabel(/Breed/i).selectOption("french_bulldog");

  await expect(page.getByRole("heading", { name: /Marcel/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Regal/i })).toHaveCount(0);
});

test("submits contact inquiry with captcha bypass", async ({ page }) => {
  await page.goto("/contact");

  const accept = page.getByRole("button", { name: /accept & continue/i });
  if (await accept.isVisible()) {
    await accept.click();
  }

  await page.getByLabel(/Your name/i).fill("Playwright Tester");
  await page.getByLabel(/^Email$/i).fill("playwright@example.com");
  await page.getByLabel(/Phone/i).fill("+1 205 555 9999");
  await page
    .getByLabel(/How can we help\?/i)
    .fill("Interested in Marcel and available delivery options for next month.");

  await page.getByRole("button", { name: /share my inquiry/i }).click();

  await expect(page.getByText(/Thanks for reaching out!/i)).toBeVisible();
});
