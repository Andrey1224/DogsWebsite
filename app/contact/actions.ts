"use server";

import { headers } from "next/headers";

import { verifyHCaptcha } from "@/lib/captcha/hcaptcha";
import { checkInquiryRateLimit } from "@/lib/inquiries/rate-limit";
import { inquirySubmissionSchema } from "@/lib/inquiries/schema";
import { createServiceRoleClient } from "@/lib/supabase/client";

export type ContactFormStatus = "idle" | "error" | "success";

export type ContactFormState = {
  status: ContactFormStatus;
  message?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export const CONTACT_FORM_INITIAL_STATE: ContactFormState = {
  status: "idle",
};

function extractFieldErrors(error: unknown): Partial<Record<string, string>> {
  if (typeof error !== "object" || !error) {
    return {};
  }

  if ("flatten" in error && typeof error.flatten === "function") {
    const flattened = error.flatten();
    const allowed = new Set(["name", "email", "phone", "message", "captcha"]);
    const fieldEntries = Object.entries(flattened.fieldErrors ?? {})
      .map(([key, value]) => {
        const normalizedKey = key === "hcaptchaToken" ? "captcha" : key;
        const message = Array.isArray(value) && value.length > 0 ? value[0] : undefined;
        return [normalizedKey, message] as const;
      })
      .filter(([key, value]) => Boolean(value) && allowed.has(key));

    return Object.fromEntries(fieldEntries) as Partial<Record<string, string>>;
  }

  return {};
}

function asString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" ? value : undefined;
}

type HeaderLike = Awaited<ReturnType<typeof headers>>;

function getClientIp(headerList: HeaderLike): string | null {
  const forwarded = headerList.get("x-forwarded-for");
  if (!forwarded) return null;
  const first = forwarded.split(",")[0]?.trim();
  return first || null;
}

export async function submitContactInquiry(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const shape = {
    name: asString(formData.get("name")),
    email: asString(formData.get("email")),
    phone: asString(formData.get("phone")),
    message: asString(formData.get("message")),
    puppyId: asString(formData.get("puppyId")),
    puppySlug: asString(formData.get("puppySlug")),
    contextPath: asString(formData.get("contextPath")),
    hcaptchaToken: asString(formData.get("h-captcha-response")),
  };

  const parsed = inquirySubmissionSchema.safeParse(shape);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: extractFieldErrors(parsed.error),
    };
  }

  const submission = parsed.data;
  const headerList = await headers();
  const clientIp = getClientIp(headerList);
  const rateLimitResult = await checkInquiryRateLimit({
    email: submission.email,
    clientIp,
  });

  if (!rateLimitResult.ok) {
    return {
      status: "error",
      message: rateLimitResult.message,
    };
  }

  const captchaResult = await verifyHCaptcha(submission.hcaptchaToken, clientIp);
  if (!captchaResult.ok) {
    return {
      status: "error",
      message: captchaResult.message,
      fieldErrors: {
        captcha: captchaResult.message,
      },
    };
  }

  const referer = headerList.get("referer") || undefined;
  const userAgent = headerList.get("user-agent") || undefined;
  const host = headerList.get("host") || undefined;

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("inquiries").insert({
    source: "form",
    name: submission.name,
    email: submission.email,
    phone: submission.phone ?? null,
    message: submission.message,
    puppy_id: submission.puppyId ?? null,
    utm: {
      host,
      referer,
      user_agent: userAgent,
      context_path: submission.contextPath ?? null,
      puppy_slug: submission.puppySlug ?? null,
    },
    client_ip: clientIp ?? null,
  });

  if (error) {
    console.error("Failed to persist inquiry", error);
    return {
      status: "error",
      message: "We couldn’t save your inquiry. Please try again shortly.",
    };
  }

  return {
    status: "success",
    message:
      "Thanks for reaching out! We’ll respond within one business day with next steps and availability.",
  };
}
