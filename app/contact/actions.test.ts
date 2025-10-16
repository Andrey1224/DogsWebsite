import { describe, it, expect, beforeEach, afterAll, vi } from "vitest";

import { submitContactInquiry } from "./actions";

const mocks = vi.hoisted(() => ({
  headers: vi.fn(),
  checkInquiryRateLimit: vi.fn(),
  verifyHCaptcha: vi.fn(),
  createServiceRoleClient: vi.fn(),
  sendOwnerNotification: vi.fn(),
  sendCustomerConfirmation: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("@/lib/inquiries/rate-limit", () => ({
  checkInquiryRateLimit: mocks.checkInquiryRateLimit,
}));

vi.mock("@/lib/captcha/hcaptcha", () => ({
  verifyHCaptcha: mocks.verifyHCaptcha,
}));

vi.mock("@/lib/supabase/client", () => ({
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock("@/lib/emails/owner-notification", () => ({
  sendOwnerNotification: mocks.sendOwnerNotification,
}));

vi.mock("@/lib/emails/customer-confirmation", () => ({
  sendCustomerConfirmation: mocks.sendCustomerConfirmation,
}));

function createFormData(overrides: Record<string, string | undefined> = {}) {
  const defaults: Record<string, string> = {
    name: "Jane Doe",
    email: "JANE@example.com",
    phone: "+1 205-000-5555",
    message:
      "Looking for a healthy bulldog with gentle temperament. Please share next litter availability.",
    puppyId: "550e8400-e29b-41d4-a716-446655440000",
    puppySlug: "blue-merle-tri",
    contextPath: "/puppies/blue-merle-tri",
    "h-captcha-response": "captcha-token",
  };

  const data = new FormData();
  const entries = { ...defaults, ...overrides };
  Object.entries(entries).forEach(([key, value]) => {
    if (value !== undefined) {
      data.set(key, value);
    }
  });
  return data;
}

function mockHeaders(values: Record<string, string | undefined> = {}) {
  const defaults = {
    "x-forwarded-for": "203.0.113.5, 10.0.0.1",
    referer: "https://example.com/contact",
    "user-agent": "Vitest",
    host: "puppy.test",
  };
  const headers = new Headers({ ...defaults, ...values });
  mocks.headers.mockReturnValue(headers);
  return headers;
}

function mockSupabaseInsert(result: { error: unknown }) {
  const insert = vi.fn().mockResolvedValue(result);
  const from = vi.fn().mockReturnValue({ insert });
  mocks.createServiceRoleClient.mockReturnValue({ from });
  return { insert, from };
}

describe("submitContactInquiry", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders();
    mocks.checkInquiryRateLimit.mockResolvedValue({ ok: true });
    mocks.verifyHCaptcha.mockResolvedValue({ ok: true, message: "Captcha verified" });
    mockSupabaseInsert({ error: null });
    mocks.sendOwnerNotification.mockResolvedValue({ success: true });
    mocks.sendCustomerConfirmation.mockResolvedValue({ success: true });
  });

  it("returns field errors when schema validation fails", async () => {
    const formData = createFormData({
      name: "A",
      email: "not-an-email",
      message: "too short",
      "h-captcha-response": "",
    });

    const result = await submitContactInquiry({ status: "idle" }, formData);

    expect(result.status).toBe("error");
    expect(result.message).toBe("Please correct the highlighted fields.");
    expect(result.fieldErrors).toMatchObject({
      name: expect.stringContaining("at least 2 characters"),
      email: expect.stringContaining("valid email"),
      message: expect.stringContaining("at least 20 characters"),
      captcha: expect.stringContaining("captcha"),
    });
    expect(mocks.checkInquiryRateLimit).not.toHaveBeenCalled();
    expect(mocks.verifyHCaptcha).not.toHaveBeenCalled();
  });

  it("returns rate limit message when inquiries exceed threshold", async () => {
    const { insert } = mockSupabaseInsert({ error: null });
    mocks.checkInquiryRateLimit.mockResolvedValue({
      ok: false,
      message: "Too many recent inquiries",
    });

    const formData = createFormData();
    const result = await submitContactInquiry({ status: "idle" }, formData);

    expect(result).toEqual({
      status: "error",
      message: "Too many recent inquiries",
    });
    expect(mocks.checkInquiryRateLimit).toHaveBeenCalledWith({
      email: "jane@example.com",
      clientIp: "203.0.113.5",
    });
    expect(mocks.verifyHCaptcha).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns captcha error when verification fails", async () => {
    const { insert } = mockSupabaseInsert({ error: null });
    mocks.verifyHCaptcha.mockResolvedValue({
      ok: false,
      message: "Captcha failed",
    });

    const formData = createFormData();
    const result = await submitContactInquiry({ status: "idle" }, formData);

    expect(result.status).toBe("error");
    expect(result.message).toBe("Captcha failed");
    expect(result.fieldErrors).toEqual({ captcha: "Captcha failed" });
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns persistence error when Supabase insert fails", async () => {
    const insertError = { message: "Database unavailable" };
    const { insert } = mockSupabaseInsert({ error: insertError });

    const formData = createFormData();
    const result = await submitContactInquiry({ status: "idle" }, formData);

    expect(insert).toHaveBeenCalled();
    expect(result).toEqual({
      status: "error",
      message: "We couldn't save your inquiry. Please try again shortly.",
    });
    expect(mocks.sendOwnerNotification).not.toHaveBeenCalled();
    expect(mocks.sendCustomerConfirmation).not.toHaveBeenCalled();
  });

  it("persists inquiry and queues notifications on success", async () => {
    const { insert } = mockSupabaseInsert({ error: null });

    const formData = createFormData();
    const result = await submitContactInquiry({ status: "idle" }, formData);

    expect(result.status).toBe("success");
    expect(result.message).toContain("Thanks for reaching out");

    expect(mocks.checkInquiryRateLimit).toHaveBeenCalledWith({
      email: "jane@example.com",
      clientIp: "203.0.113.5",
    });
    expect(mocks.verifyHCaptcha).toHaveBeenCalledWith("captcha-token", "203.0.113.5");

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "form",
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+1 205-000-5555",
        message:
          "Looking for a healthy bulldog with gentle temperament. Please share next litter availability.",
        puppy_id: "550e8400-e29b-41d4-a716-446655440000",
        utm: expect.objectContaining({
          host: "puppy.test",
          referer: "https://example.com/contact",
          user_agent: "Vitest",
          context_path: "/puppies/blue-merle-tri",
          puppy_slug: "blue-merle-tri",
        }),
        client_ip: "203.0.113.5",
      }),
    );

    expect(mocks.sendOwnerNotification).toHaveBeenCalledWith({
      inquiry: expect.objectContaining({
        name: "Jane Doe",
        email: "jane@example.com",
        message:
          "Looking for a healthy bulldog with gentle temperament. Please share next litter availability.",
        puppy_id: "550e8400-e29b-41d4-a716-446655440000",
        source: "form",
      }),
    });
    expect(mocks.sendCustomerConfirmation).toHaveBeenCalledWith({
      name: "Jane Doe",
      email: "jane@example.com",
    });
  });
});
