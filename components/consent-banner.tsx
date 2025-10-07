"use client";

import { useAnalytics } from "@/components/analytics-provider";

export function ConsentBanner() {
  const { consent, grantConsent, denyConsent } = useAnalytics();

  if (consent !== "unknown") {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 px-6 py-4 text-sm shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">Cookies & analytics</p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
            We use Google Analytics and Meta Pixel to measure interest in our puppies. Accept to enable tracking or decline to stay anonymous.
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            onClick={denyConsent}
            className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={grantConsent}
            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
          >
            Accept & continue
          </button>
        </div>
      </div>
    </div>
  );
}
