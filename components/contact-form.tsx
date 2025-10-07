"use client";

import { useActionState, useCallback, useEffect, useId, useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { usePathname } from "next/navigation";

import {
  CONTACT_FORM_INITIAL_STATE,
  submitContactInquiry,
  type ContactFormState,
} from "@/app/contact/actions";
import { useAnalytics } from "@/components/analytics-provider";

const HC_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
const HC_BYPASS_TOKEN = process.env.NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN;

type ContactFormProps = {
  heading?: {
    eyebrow?: string;
    title?: string;
    description?: string;
  };
  context?: {
    puppyId?: string | null;
    puppySlug?: string | null;
  };
};

type FieldName = "name" | "email" | "phone" | "message" | "captcha";

export function ContactForm({ heading, context }: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  type HCaptchaInstance = InstanceType<typeof HCaptcha>;
  const captchaRef = useRef<HCaptchaInstance | null>(null);
  const pathname = usePathname();
  const isBypass = Boolean(HC_BYPASS_TOKEN);
  const [captchaToken, setCaptchaToken] = useState<string | null>(HC_BYPASS_TOKEN ?? null);
  const successTrackedRef = useRef(false);
  const { trackEvent } = useAnalytics();
  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(
    submitContactInquiry,
    CONTACT_FORM_INITIAL_STATE,
  );

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const messageId = useId();

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setCaptchaToken(HC_BYPASS_TOKEN ?? null);
      if (!isBypass) {
        captchaRef.current?.resetCaptcha();
      }
    }
  }, [isBypass, state.status]);

  useEffect(() => {
    if (state.status === "success" && !successTrackedRef.current) {
      trackEvent("form_success", {
        context_path: pathname,
        location: context?.puppySlug ? "puppy_detail" : "contact_page",
        puppy_slug: context?.puppySlug ?? undefined,
      });
      successTrackedRef.current = true;
    }
  }, [context?.puppySlug, pathname, state.status, trackEvent]);

  const handleSubmit = useCallback(() => {
    successTrackedRef.current = false;
    trackEvent("form_submit", {
      context_path: pathname,
      location: context?.puppySlug ? "puppy_detail" : "contact_page",
      puppy_slug: context?.puppySlug ?? undefined,
    });
  }, [context?.puppySlug, pathname, trackEvent]);

  const showCaptchaWarning = !HC_SITE_KEY && !isBypass;

  const fieldErrors = state.fieldErrors ?? {};

  const renderError = (field: FieldName) => {
    const message = fieldErrors[field];
    if (!message) return null;
    return <p className="text-xs text-red-600 dark:text-red-400">{message}</p>;
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80"
    >
      {heading ? (
        <header className="space-y-2">
          {heading.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">
              {heading.eyebrow}
            </p>
          ) : null}
          {heading.title ? (
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              {heading.title}
            </h2>
          ) : null}
          {heading.description ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{heading.description}</p>
          ) : null}
        </header>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200" htmlFor={nameId}>
            Your name
          </label>
          <input
            id={nameId}
            name="name"
            type="text"
            required
            placeholder="Jane Doe"
            className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950"
            aria-invalid={fieldErrors.name ? "true" : "false"}
          />
          {renderError("name")}
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200" htmlFor={emailId}>
            Email
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950"
            aria-invalid={fieldErrors.email ? "true" : "false"}
            autoComplete="email"
          />
          {renderError("email")}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200" htmlFor={phoneId}>
          Phone (optional)
        </label>
        <input
          id={phoneId}
          name="phone"
          type="tel"
          placeholder="+1 (205) 555-1234"
          className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950"
          aria-invalid={fieldErrors.phone ? "true" : "false"}
          autoComplete="tel"
        />
        {renderError("phone")}
      </div>

      <div>
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200" htmlFor={messageId}>
          How can we help?
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={4}
          required
          placeholder="Tell us about the puppy you’re interested in, your timeline, and any must-have traits."
          className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950"
          aria-invalid={fieldErrors.message ? "true" : "false"}
        />
        {renderError("message")}
      </div>

      <input type="hidden" name="puppyId" value={context?.puppyId ?? ""} />
      <input type="hidden" name="puppySlug" value={context?.puppySlug ?? ""} />
      <input type="hidden" name="contextPath" value={pathname} />

      <div className="space-y-2">
        {showCaptchaWarning ? (
          <p className="rounded-2xl border border-dashed border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Add `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` and `HCAPTCHA_SECRET_KEY` to enable spam protection.
          </p>
        ) : isBypass ? (
          <p className="rounded-2xl border border-dashed border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Captcha bypass enabled for local testing. Remove `NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN` in production.
          </p>
        ) : (
          <HCaptcha
            ref={(instance) => {
              captchaRef.current = instance;
            }}
            sitekey={HC_SITE_KEY!}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
            theme="light"
          />
        )}
        <input type="hidden" name="h-captcha-response" value={captchaToken ?? ""} />
        {renderError("captcha")}
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        We respond within one business day. By submitting, you consent to be contacted about current and
        upcoming litters.
      </p>

      <button
        type="submit"
        className="w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-75"
        disabled={isPending || showCaptchaWarning || !captchaToken}
      >
        {isPending ? "Sending…" : "Share my inquiry"}
      </button>

      {state.status === "success" ? (
        <p className="rounded-2xl bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          {state.message}
        </p>
      ) : null}

      {state.status === "error" && state.message ? (
        <p className="rounded-2xl bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
