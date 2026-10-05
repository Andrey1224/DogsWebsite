import { test, expect, type Locator } from '@playwright/test';

const ADMIN_LOGIN = process.env.ADMIN_LOGIN ?? 'owner@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'supersecure';

test.beforeEach(async ({ context }) => {
  // Not exercising consent behavior here — preset it at the context level so the banner
  // never blocks assertions on either the admin tab or the public tab opened mid-test.
  await context.addInitScript(() => {
    window.localStorage.setItem('exoticbulldoglegacy-consent', 'granted');
  });
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

test('admin dashboard loads with creation form toggle', async ({ page }) => {
  await page.goto('/admin/login');

  await page.getByLabel(/email address/i).fill(ADMIN_LOGIN);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: /manage puppies/i })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole('button', { name: /add puppy/i }).click();

  const createForm = page.getByRole('form', { name: /create puppy form/i });
  await expect(createForm).toBeVisible();

  await createForm.locator('input[name="name"]').fill('Playwright Smoke Puppy');
  await createForm.locator('input[name="slug"]').fill(slugify('Playwright Smoke Puppy'));
  await createForm.getByRole('button', { name: /cancel/i }).click();

  const list = page.getByTestId('admin-puppy-list');
  const rows = list.locator('li');
  const rowCount = await rows.count();

  if (rowCount > 0) {
    const firstRow = rows.first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow.getByRole('combobox')).toBeEnabled();
  } else {
    await expect(page.getByText(/No puppies yet/i, { exact: false })).toBeVisible();
  }
});

/**
 * ---------------------------------------------------------------------------------------
 * Mutation test — writes real data through the admin status dropdown.
 *
 * SAFETY INCIDENT (2026-10-05): there is currently no dedicated Supabase project for E2E —
 * `playwright.config.ts` always targets localhost:3000, which reads the real `.env.local`
 * Supabase credentials. The original version of this test picked "the first row" in the
 * admin puppy list, toggled its status, and restored it with an unverified
 * `waitForTimeout`. A raced/failed restore silently left a real puppy ("Nippet") stuck in
 * `reserved` status in production with no corresponding reservation — found and fixed via
 * direct SQL; see memory-bank/activeContext.md for the full writeup.
 *
 * A later revision verified the restore with `expect.poll(() => statusSelect.inputValue())`,
 * but `selectOption()` updates the DOM value immediately, before the server action resolves —
 * polling the same in-memory `<select>` only proves the click registered, not that Supabase
 * actually persisted it. This revision instead reloads `/admin/puppies` and re-fetches the
 * row from the server after every status change, which is the only way to confirm the write
 * actually landed.
 *
 * Until a dedicated Supabase test project with its own seed/cleanup fixture exists (the
 * correct long-term fix), this test:
 *   - is SKIPPED BY DEFAULT, so a plain `npm run e2e` / `npx playwright test` never runs it
 *   - requires an explicit opt-in: E2E_ALLOW_ADMIN_MUTATIONS=true
 *   - requires E2E_TEST_PUPPY_SLUG naming one specific, disposable test puppy — it never
 *     falls back to "the first row" or any other real/production puppy
 *   - requires E2E_TEST_SUPABASE_PROJECT_REF, an ALLOWLIST (not a blocklist): the Supabase
 *     project ref resolved from SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL must match it
 *     exactly, or the test refuses to run. This is safer than hardcoding "known production"
 *     refs to block, which silently stops protecting anything if the production project is
 *     ever recreated or migrated.
 *   - after every status change (the mutation and the restore), waits for the server action
 *     to confirm success (success toast + the dropdown re-enabling), then reloads the admin
 *     page and re-reads the status from a fresh server fetch — never a fixed `waitForTimeout`
 *     and never trusting client-side DOM state alone
 *   - restores the original status in a try/finally
 * ---------------------------------------------------------------------------------------
 */

function resolveSupabaseProjectRef(): string | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const match = url.match(/^https?:\/\/([a-z0-9]+)\.supabase\.co/i);
  return match ? match[1] : null;
}

const MUTATION_OPT_IN = process.env.E2E_ALLOW_ADMIN_MUTATIONS === 'true';
const TEST_PUPPY_SLUG = process.env.E2E_TEST_PUPPY_SLUG;
const REQUIRED_TEST_PROJECT_REF = process.env.E2E_TEST_SUPABASE_PROJECT_REF;
const RESOLVED_PROJECT_REF = resolveSupabaseProjectRef();
const PROJECT_REF_ALLOWED =
  Boolean(REQUIRED_TEST_PROJECT_REF) &&
  Boolean(RESOLVED_PROJECT_REF) &&
  REQUIRED_TEST_PROJECT_REF === RESOLVED_PROJECT_REF;

test.describe('admin status mutation (opt-in, requires allowlisted test project)', () => {
  // Keep retries at 0 for this block specifically — a retry would re-run the full
  // toggle-and-restore sequence against real data, doubling the blast radius of any flake.
  test.describe.configure({ retries: 0 });

  test.skip(
    !MUTATION_OPT_IN,
    'Requires explicit opt-in: set E2E_ALLOW_ADMIN_MUTATIONS=true to run this data-mutating test.',
  );
  test.skip(
    MUTATION_OPT_IN && !TEST_PUPPY_SLUG,
    'Requires E2E_TEST_PUPPY_SLUG naming one dedicated disposable test puppy — this test never uses "the first row" or any other real puppy.',
  );
  test.skip(
    MUTATION_OPT_IN && !REQUIRED_TEST_PROJECT_REF,
    'Requires E2E_TEST_SUPABASE_PROJECT_REF — an allowlisted Supabase project ref this test is permitted to mutate. Refusing to run without it.',
  );
  test.skip(
    MUTATION_OPT_IN && Boolean(REQUIRED_TEST_PROJECT_REF) && !RESOLVED_PROJECT_REF,
    'Could not resolve a Supabase project ref from SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL — refusing to mutate data without confirming the target project.',
  );
  test.skip(
    MUTATION_OPT_IN &&
      Boolean(REQUIRED_TEST_PROJECT_REF) &&
      Boolean(RESOLVED_PROJECT_REF) &&
      !PROJECT_REF_ALLOWED,
    `Refusing to run: resolved Supabase project ref (${RESOLVED_PROJECT_REF}) does not match the allowlisted E2E_TEST_SUPABASE_PROJECT_REF (${REQUIRED_TEST_PROJECT_REF}).`,
  );

  test('admin can change puppy status and it reflects on public site', async ({
    page,
    context,
  }) => {
    // Defense in depth: never proceed if the allowlist or fixture-slug guards above were
    // ever refactored incorrectly.
    if (!PROJECT_REF_ALLOWED || !TEST_PUPPY_SLUG) {
      test.skip();
      return;
    }
    const testPuppySlug = TEST_PUPPY_SLUG;

    async function locateTestPuppyRow(): Promise<Locator> {
      const list = page.getByTestId('admin-puppy-list');
      const row = list.locator('li').filter({ hasText: testPuppySlug });
      await expect(
        row,
        `E2E_TEST_PUPPY_SLUG="${testPuppySlug}" did not match exactly one row in the admin puppy list.`,
      ).toHaveCount(1, { timeout: 10_000 });
      return row;
    }

    // The only trustworthy confirmation that a status change persisted in Supabase: a full
    // navigation back to the admin list, which re-fetches from the server (the page is an
    // async Server Component reading directly from Supabase on every request), followed by
    // re-locating the row and reading its dropdown's server-rendered value.
    async function reloadAndReadPersistedStatus(): Promise<string> {
      await page.goto('/admin/puppies');
      await page.waitForLoadState('networkidle');
      const row = await locateTestPuppyRow();
      const select = row.getByRole('combobox');
      await expect(select).toBeEnabled();
      return select.inputValue();
    }

    async function changeStatusAndConfirmPersisted(targetStatus: string) {
      const row = await locateTestPuppyRow();
      const select = row.getByRole('combobox');
      await expect(select).toBeEnabled();

      await select.selectOption(targetStatus);

      // Wait for the server action to actually resolve: the success toast only fires after
      // `updatePuppyStatusAction` resolves, and the dropdown re-enabling confirms the
      // subsequent `router.refresh()` re-render completed — neither is a fixed timeout.
      await expect(
        page.getByText(`Status updated to ${targetStatus}`, { exact: false }),
      ).toBeVisible({ timeout: 10_000 });
      await expect(select).toBeEnabled({ timeout: 10_000 });

      // Still not proof of persistence — only a reload + fresh server fetch is.
      const persisted = await reloadAndReadPersistedStatus();
      expect(
        persisted,
        `Expected status "${targetStatus}" to persist in Supabase after reload, got "${persisted}".`,
      ).toBe(targetStatus);
    }

    // Step 1: Login to admin
    await page.goto('/admin/login');
    await page.getByLabel(/email address/i).fill(ADMIN_LOGIN);
    await page.getByLabel('Password').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /manage puppies/i })).toBeVisible({
      timeout: 15_000,
    });

    // Step 2: Locate the one designated disposable test puppy by slug and record its status.
    const initialRow = await locateTestPuppyRow();
    const currentStatus = await initialRow.getByRole('combobox').inputValue();
    const newStatus = currentStatus === 'available' ? 'reserved' : 'available';

    try {
      // Step 3: Change the status and confirm it actually persisted in Supabase.
      await changeStatusAndConfirmPersisted(newStatus);

      // Step 4: Verify the change reflects on the public site.
      const publicPage = await context.newPage();
      await publicPage.goto(`/puppies/${testPuppySlug}?_t=${Date.now()}`);
      await publicPage.waitForLoadState('networkidle');
      const heading = publicPage.locator('h1').first();
      await expect(heading).toBeVisible({ timeout: 5000 });
      await publicPage.close();
    } finally {
      // Step 5: Always attempt to restore, and confirm the restore persisted the same way —
      // via reload + re-fetch, never a fixed wait like the original version of this test did.
      await changeStatusAndConfirmPersisted(currentStatus);
    }
  });
});
