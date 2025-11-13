import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";

test("filters puppies by status and breed", async ({ page }) => {
  await page.goto("/puppies");
  await page.waitForLoadState("domcontentloaded");

  const statusSelect = page.getByLabel(/Status/i);
  await statusSelect.waitFor({ state: "visible", timeout: 15_000 });
  await statusSelect.selectOption("available");

  const breedSelect = page.getByLabel(/Breed/i);
  await breedSelect.waitFor({ state: "visible", timeout: 15_000 });
  await breedSelect.selectOption("french_bulldog");

  await expect(page.getByRole("heading", { name: /Marcel/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Regal/i })).toHaveCount(0);
});

test("submits contact inquiry with captcha bypass", async ({ page }) => {
  await page.goto("/contact");
  await page.waitForLoadState("domcontentloaded");

  const accept = page.getByRole("button", { name: /accept & continue/i });
  if (await accept.isVisible()) {
    await accept.click();
  }

  await page.getByLabel(/Your name/i).fill("Playwright Tester");
  const uniqueEmail = `playwright+${randomUUID()}@example.com`;
  await page.getByLabel(/^Email$/i).fill(uniqueEmail);
  await page.getByLabel(/Phone/i).fill("+1 205 555 9999");
  await page
    .getByLabel(/How can we help\?/i)
    .fill("Interested in Marcel and available delivery options for next month.");

  await page.getByRole("button", { name: /share my inquiry/i }).click();

  await expect(page.getByText(/Thanks for reaching out!/i)).toBeVisible({ timeout: 15_000 });
});
