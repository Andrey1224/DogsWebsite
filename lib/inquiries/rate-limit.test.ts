import { describe, it, expect, beforeEach, vi } from "vitest";

import { checkInquiryRateLimit } from "./rate-limit";

const mocks = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

type QueryResult = { count?: number | null; error?: unknown };

function setupSupabase(results: QueryResult[]) {
  const queue = [...results];
  const gte = vi.fn().mockImplementation(() =>
    Promise.resolve(queue.shift() ?? { count: 0, error: null }),
  );
  const eq = vi.fn().mockReturnValue({ gte });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  mocks.createServiceRoleClient.mockReturnValue({ from });
  return { from, select, eq, gte };
}

describe("checkInquiryRateLimit", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows inquiry when counts are below thresholds", async () => {
    const { eq, gte } = setupSupabase([
      { count: 2, error: null },
      { count: 4, error: null },
    ]);

    const result = await checkInquiryRateLimit({
      email: "jane@example.com",
      clientIp: "198.51.100.10",
    });

    expect(result).toEqual({ ok: true });
    expect(eq).toHaveBeenNthCalledWith(1, "email", "jane@example.com");
    expect(eq).toHaveBeenNthCalledWith(2, "client_ip", "198.51.100.10");
    expect(gte).toHaveBeenCalledTimes(2);
    const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    expect(gte).toHaveBeenNthCalledWith(1, "created_at", windowStart);
  });

  it("blocks by email when threshold exceeded", async () => {
    setupSupabase([{ count: 3, error: null }]);

    const result = await checkInquiryRateLimit({
      email: "overlimit@example.com",
      clientIp: "198.51.100.11",
    });

    expect(result).toEqual({
      ok: false,
      reason: "email",
      message: "You’ve already sent a few inquiries. We’ll be in touch shortly.",
    });
  });

  it("blocks by IP when threshold exceeded", async () => {
    setupSupabase([
      { count: 1, error: null },
      { count: 5, error: null },
    ]);

    const result = await checkInquiryRateLimit({
      email: "ok@example.com",
      clientIp: "198.51.100.12",
    });

    expect(result).toEqual({
      ok: false,
      reason: "ip",
      message:
        "Looks like several inquiries came from this connection. Please wait before submitting again.",
    });
  });

  it("skips IP checks when client IP is missing", async () => {
    const { from, eq, gte } = setupSupabase([{ count: 0, error: null }]);

    const result = await checkInquiryRateLimit({
      email: "anonymous@example.com",
      clientIp: undefined,
    });

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledTimes(1);
    expect(eq).toHaveBeenCalledTimes(1);
    expect(gte).toHaveBeenCalledTimes(1);
  });

  it("throws when Supabase returns an error", async () => {
    const supabaseError = new Error("db failure");
    setupSupabase([{ error: supabaseError }]);

    await expect(
      checkInquiryRateLimit({ email: "error@example.com", clientIp: "198.51.100.13" }),
    ).rejects.toThrow("db failure");
  });
});
