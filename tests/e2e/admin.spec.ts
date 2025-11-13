import { test, expect } from "@playwright/test";

const ADMIN_LOGIN = process.env.ADMIN_LOGIN ?? "owner@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "supersecure";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

test("admin dashboard loads with creation form toggle", async ({ page }) => {
  await page.goto("/admin/login");

  await page.getByLabel("Login").fill(ADMIN_LOGIN);
  await page.getByLabel("Password").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("heading", { name: /manage puppies/i }),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /add puppy/i }).click();

  const createForm = page.getByRole("form", { name: /create puppy form/i });
  await expect(createForm).toBeVisible();

  await createForm.locator('input[name="name"]').fill("Playwright Smoke Puppy");
  await createForm.locator('input[name="slug"]').fill(slugify("Playwright Smoke Puppy"));
  await createForm.getByRole("button", { name: /cancel/i }).click();

  const list = page.getByTestId("admin-puppy-list");
  const firstRow = list.locator("li").first();

  await expect(firstRow).toBeVisible();
  await expect(firstRow.getByRole("combobox")).toBeEnabled();
});
