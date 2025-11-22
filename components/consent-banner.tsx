'use client';

import Link from 'next/link';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAnalytics } from '@/components/analytics-provider';

export function ConsentBanner() {
  const { consent, grantConsent, denyConsent } = useAnalytics();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (consent === 'unknown') {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [consent]);

  if (consent !== 'unknown' || !isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-center sm:inset-x-6">
      <div className="relative w-full max-w-5xl animate-slideUp overflow-hidden rounded-[28px] border border-slate-800 bg-[#0b1120]/95 p-5 text-sm shadow-[0_20px_70px_rgba(5,10,25,0.65)] backdrop-blur-xl sm:p-6">
        <div className="pointer-events-auto flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
          <div className="flex flex-1 items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/25 shadow-inner">
              <Cookie size={22} />
            </div>
            <div className="space-y-3 text-slate-200">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1 ring-1 ring-slate-700">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  Privacy-first
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1 ring-1 ring-slate-700">
                  <Cookie size={14} className="text-orange-300" />
                  Analytics Only
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-base font-semibold text-white">We use cookies responsibly</p>
                <p className="text-[13px] leading-relaxed text-slate-300">
                  We use Google Analytics and Meta Pixel to measure interest in our puppies. Data is
                  anonymous and helps us find the best homes.
                </p>
                <Link
                  href="/policies"
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-400 underline underline-offset-4 transition hover:text-orange-300"
                >
                  Read our privacy policy
                </Link>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-[320px] md:flex-row md:justify-end">
            <button
              type="button"
              onClick={denyConsent}
              className="w-full rounded-xl border border-slate-700 bg-[#0f172a]/60 px-4 py-3 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-[#15213b]"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={grantConsent}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(234,88,12,0.25)] transition hover:from-orange-400 hover:to-orange-500"
            >
              Accept & Continue
            </button>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close cookie banner"
          onClick={denyConsent}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-slate-800/70 hover:text-white md:hidden"
        >
          <X size={18} />
        </button>

        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute -bottom-16 right-0 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute inset-0 rounded-[28px] border border-white/5" />
        </div>
      </div>
    </div>
  );
}
