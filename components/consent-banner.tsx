'use client';

import { useAnalytics } from '@/components/analytics-provider';

export function ConsentBanner() {
  const { consent, grantConsent, denyConsent } = useAnalytics();

  if (consent !== 'unknown') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 px-6 py-4 text-sm shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-text">Cookies & analytics</p>
          <p className="mt-1 text-xs text-muted">
            We use Google Analytics and Meta Pixel to measure interest in our puppies. Accept to
            enable tracking or decline to stay anonymous.
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            onClick={denyConsent}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-text transition hover:bg-[color:var(--hover)]"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={grantConsent}
            className="rounded-full bg-[color:var(--btn-bg)] px-4 py-2 text-xs font-semibold text-[color:var(--btn-text)] transition hover:brightness-105"
          >
            Accept & continue
          </button>
        </div>
      </div>
    </div>
  );
}
