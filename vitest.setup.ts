import { vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { toHaveNoViolations } from "jest-axe";
import { createSupabaseFixture } from "./tests/fixtures/supabase-client-fixture";

// Extend Vitest's expect with jest-axe matchers
expect.extend(toHaveNoViolations);

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
}

vi.mock("server-only", () => ({}));

vi.mock("next/cache", () => {
  const revalidatePath = vi.fn(async () => true);
  const revalidateTag = vi.fn(async () => true);

  return {
    revalidatePath,
    revalidateTag,
    default: { revalidatePath, revalidateTag },
  };
});

const supabaseFixture = createSupabaseFixture({
  tables: {
    puppies: [],
    reservations: [],
    webhook_events: [],
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).__SUPABASE_FIXTURE__ = supabaseFixture;

beforeEach(() => {
  vi.clearAllMocks();
  supabaseFixture.reset();
});
