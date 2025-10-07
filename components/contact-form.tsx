"use client";

import { FormEvent, useState } from "react";

export function ContactFormShell() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80"
    >
      <div>
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Your name
          <input
            type="text"
            name="name"
            placeholder="Jane Doe"
            required
            className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Email
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950"
          />
        </label>
        <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Phone
          <input
            type="tel"
            name="phone"
            placeholder="+1 (205) 555-1234"
            className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950"
          />
        </label>
      </div>
      <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        Message
        <textarea
          name="message"
          rows={4}
          placeholder="Tell us about the puppy you’re interested in and the best time to contact you."
          className="mt-2 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950"
          required
        />
      </label>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        This form will connect to Supabase inquiries in Sprint 2. For immediate questions, call or
        use WhatsApp via the contact bar.
      </p>
      <button
        type="submit"
        className="w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        Share my inquiry
      </button>
      {submitted ? (
        <p className="rounded-2xl bg-emerald-50/80 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          Thanks! This placeholder captures your interest. We’ll wire it to Supabase in Sprint 2.
        </p>
      ) : null}
    </form>
  );
}
