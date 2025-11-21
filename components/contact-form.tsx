// Contact form with dark variant support and two-column layout
'use client';

import { useActionState, useCallback, useEffect, useId, useRef, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { usePathname } from 'next/navigation';
import { Check, Send } from 'lucide-react';

import { submitContactInquiry } from '@/app/contact/actions';
import type { ContactFormState } from '@/app/contact/actions';
import { useAnalytics } from '@/components/analytics-provider';

const HC_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;
const HC_BYPASS_TOKEN = process.env.NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN;

const CONTACT_FORM_INITIAL_STATE: ContactFormState = {
  status: 'idle',
};

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
  variant?: 'default' | 'dark';
};

type FieldName = 'name' | 'email' | 'phone' | 'message' | 'captcha';

export function ContactForm({ heading, context, variant = 'default' }: ContactFormProps) {
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

  // Persist form values on validation errors
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setFormValues({ name: '', email: '', phone: '', message: '' });
      setCaptchaToken(HC_BYPASS_TOKEN ?? null);
      if (!isBypass) {
        captchaRef.current?.resetCaptcha();
      }
    }
  }, [isBypass, state.status]);

  useEffect(() => {
    if (state.status === 'success' && !successTrackedRef.current) {
      trackEvent('form_success', {
        context_path: pathname,
        location: context?.puppySlug ? 'puppy_detail' : 'contact_page',
        puppy_slug: context?.puppySlug ?? undefined,
      });
      successTrackedRef.current = true;
    }
  }, [context?.puppySlug, pathname, state.status, trackEvent]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      successTrackedRef.current = false;

      // Capture form values before submission
      const formData = new FormData(e.currentTarget);
      setFormValues({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        message: formData.get('message') as string,
      });

      trackEvent('form_submit', {
        context_path: pathname,
        location: context?.puppySlug ? 'puppy_detail' : 'contact_page',
        puppy_slug: context?.puppySlug ?? undefined,
      });
    },
    [context?.puppySlug, pathname, trackEvent],
  );

  const handleResetForm = () => {
    formRef.current?.reset();
    setFormValues({ name: '', email: '', phone: '', message: '' });
    setCaptchaToken(HC_BYPASS_TOKEN ?? null);
    if (!isBypass) {
      captchaRef.current?.resetCaptcha();
    }
    // Reset state by triggering a re-render
    window.location.reload();
  };

  const showCaptchaWarning = !HC_SITE_KEY && !isBypass;

  const fieldErrors = state.fieldErrors ?? {};

  const renderError = (field: FieldName) => {
    const message = fieldErrors[field];
    if (!message) return null;
    return <p className="text-xs text-red-600">{message}</p>;
  };

  const isDark = variant === 'dark';

  // Success State (Full Replacement for Dark Mode)
  if (isDark && state.status === 'success') {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-400">
          <Check size={40} />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-white">Inquiry Received!</h3>
        <p className="text-slate-400">{state.message || "We'll be in touch within 24 hours."}</p>
        <button
          onClick={handleResetForm}
          className="mt-8 text-sm font-bold text-orange-400 hover:text-orange-300"
        >
          Send another message
        </button>
      </div>
    );
  }

  // Dark Variant - Two Column Layout
  if (isDark) {
    return (
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        {/* Left: Context */}
        <div className="space-y-8 lg:col-span-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-white">Send an introduction</h2>
            <p className="leading-relaxed text-slate-400">
              Let us know the puppy you&apos;re eyeing, your preferred timeline, and how you&apos;d
              like us to connect.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-lg bg-slate-800 p-2 text-orange-400">
                <Check size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Priority Waitlist</p>
                <p className="text-xs text-slate-500">Get notified before public listing.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 rounded-lg bg-slate-800 p-2 text-orange-400">
                <Check size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Facetime Meet & Greet</p>
                <p className="text-xs text-slate-500">Schedule a live video call.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <form
          ref={formRef}
          action={formAction}
          onSubmit={handleSubmit}
          className="space-y-6 lg:col-span-3"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400"
                htmlFor={nameId}
              >
                Your Name
              </label>
              <input
                id={nameId}
                name="name"
                type="text"
                required
                placeholder="Jane Doe"
                defaultValue={formValues.name}
                className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-white transition-colors focus:border-orange-500 focus:outline-none"
                aria-invalid={fieldErrors.name ? 'true' : 'false'}
              />
              {renderError('name')}
            </div>
            <div className="space-y-2">
              <label
                className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400"
                htmlFor={emailId}
              >
                Email
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                defaultValue={formValues.email}
                className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-white transition-colors focus:border-orange-500 focus:outline-none"
                aria-invalid={fieldErrors.email ? 'true' : 'false'}
                autoComplete="email"
              />
              {renderError('email')}
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400"
              htmlFor={phoneId}
            >
              Phone (Optional)
            </label>
            <input
              id={phoneId}
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              defaultValue={formValues.phone}
              className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-white transition-colors focus:border-orange-500 focus:outline-none"
              aria-invalid={fieldErrors.phone ? 'true' : 'false'}
              autoComplete="tel"
            />
            {renderError('phone')}
          </div>

          <div className="space-y-2">
            <label
              className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-400"
              htmlFor={messageId}
            >
              How can we help?
            </label>
            <textarea
              id={messageId}
              name="message"
              rows={4}
              required
              placeholder="Tell us about the puppy you're interested in, your timeline, and any must-have traits..."
              defaultValue={formValues.message}
              className="w-full resize-none rounded-xl border border-slate-700 bg-[#0B1120] px-4 py-3.5 text-white transition-colors focus:border-orange-500 focus:outline-none"
              aria-invalid={fieldErrors.message ? 'true' : 'false'}
            />
            {renderError('message')}
          </div>

          <input type="hidden" name="puppyId" value={context?.puppyId ?? ''} />
          <input type="hidden" name="puppySlug" value={context?.puppySlug ?? ''} />
          <input type="hidden" name="contextPath" value={pathname} />

          <div className="space-y-2">
            {showCaptchaWarning ? (
              <p className="rounded-2xl border border-dashed border-orange-500/50 bg-orange-500/10 px-4 py-3 text-sm text-orange-400">
                Add `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` and `HCAPTCHA_SECRET_KEY` to enable spam
                protection.
              </p>
            ) : isBypass ? (
              <p className="rounded-2xl border border-dashed border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm text-orange-400">
                Captcha bypass enabled for local testing. Remove `NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN`
                in production.
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
                theme="dark"
              />
            )}
            <input type="hidden" name="h-captcha-response" value={captchaToken ?? ''} />
            {renderError('captcha')}
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isPending || showCaptchaWarning || !captchaToken}
          >
            {isPending ? (
              'Sending...'
            ) : (
              <>
                Share my inquiry <Send size={18} />
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-500">
            We respond within one business day. By submitting, you consent to be contacted about
            current and upcoming litters.
          </p>

          {state.status === 'error' && state.message ? (
            <p className="rounded-2xl bg-red-50/10 px-4 py-3 text-sm text-red-400">
              {state.message}
            </p>
          ) : null}
        </form>
      </div>
    );
  }

  // Default Variant (Original Light Theme)
  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      {heading ? (
        <header className="space-y-2">
          {heading.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-aux">
              {heading.eyebrow}
            </p>
          ) : null}
          {heading.title ? (
            <h2 className="text-2xl font-semibold tracking-tight text-text">{heading.title}</h2>
          ) : null}
          {heading.description ? <p className="text-sm text-muted">{heading.description}</p> : null}
        </header>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-text" htmlFor={nameId}>
            Your name
          </label>
          <input
            id={nameId}
            name="name"
            type="text"
            required
            placeholder="Jane Doe"
            defaultValue={formValues.name}
            className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm shadow-sm focus:border-accent focus:outline-none"
            aria-invalid={fieldErrors.name ? 'true' : 'false'}
          />
          {renderError('name')}
        </div>
        <div>
          <label className="block text-sm font-semibold text-text" htmlFor={emailId}>
            Email
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            defaultValue={formValues.email}
            className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm shadow-sm focus:border-accent focus:outline-none"
            aria-invalid={fieldErrors.email ? 'true' : 'false'}
            autoComplete="email"
          />
          {renderError('email')}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text" htmlFor={phoneId}>
          Phone (optional)
        </label>
        <input
          id={phoneId}
          name="phone"
          type="tel"
          placeholder="+1 (205) 555-1234"
          defaultValue={formValues.phone}
          className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm shadow-sm focus:border-accent focus:outline-none"
          aria-invalid={fieldErrors.phone ? 'true' : 'false'}
          autoComplete="tel"
        />
        {renderError('phone')}
      </div>

      <div>
        <label className="block text-sm font-semibold text-text" htmlFor={messageId}>
          How can we help?
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={4}
          required
          placeholder="Tell us about the puppy you're interested in, your timeline, and any must-have traits."
          defaultValue={formValues.message}
          className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm shadow-sm focus:border-accent focus:outline-none"
          aria-invalid={fieldErrors.message ? 'true' : 'false'}
        />
        {renderError('message')}
      </div>

      <input type="hidden" name="puppyId" value={context?.puppyId ?? ''} />
      <input type="hidden" name="puppySlug" value={context?.puppySlug ?? ''} />
      <input type="hidden" name="contextPath" value={pathname} />

      <div className="space-y-2">
        {showCaptchaWarning ? (
          <p className="rounded-2xl border border-dashed border-accent/50 bg-[color:color-mix(in srgb, var(--accent) 18%, var(--bg))] px-4 py-3 text-sm text-accent-aux">
            Add `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` and `HCAPTCHA_SECRET_KEY` to enable spam protection.
          </p>
        ) : isBypass ? (
          <p className="rounded-2xl border border-dashed border-accent-aux/40 bg-[color:color-mix(in srgb, var(--accent-aux) 14%, var(--bg))] px-4 py-3 text-sm text-accent-aux">
            Captcha bypass enabled for local testing. Remove `NEXT_PUBLIC_HCAPTCHA_BYPASS_TOKEN` in
            production.
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
        <input type="hidden" name="h-captcha-response" value={captchaToken ?? ''} />
        {renderError('captcha')}
      </div>

      <p className="text-xs text-muted">
        We respond within one business day. By submitting, you consent to be contacted about current
        and upcoming litters.
      </p>

      <button
        type="submit"
        className="w-full rounded-full bg-[color:var(--btn-bg)] px-6 py-3 text-sm font-semibold text-[color:var(--btn-text)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-75"
        disabled={isPending || showCaptchaWarning || !captchaToken}
      >
        {isPending ? 'Sending…' : 'Share my inquiry'}
      </button>

      {state.status === 'success' ? (
        <p className="rounded-2xl bg-[color:color-mix(in srgb, var(--accent) 18%, var(--bg))] px-4 py-3 text-sm text-accent-aux">
          {state.message}
        </p>
      ) : null}

      {state.status === 'error' && state.message ? (
        <p className="rounded-2xl bg-red-50/80 px-4 py-3 text-sm text-red-700">{state.message}</p>
      ) : null}
    </form>
  );
}
