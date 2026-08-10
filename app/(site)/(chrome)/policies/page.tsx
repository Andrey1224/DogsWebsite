import Link from 'next/link';
import { ShieldCheck, Lock, ArrowRight, Info, CreditCard } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Policies',
  description: "Find Exotic Bulldog Legacy's Privacy Policy and Terms of Service / Deposit Terms.",
  path: '/policies',
});

export default function PoliciesHubPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] pb-20 font-sans text-white">
      <div className="sr-only">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Policies', href: '/policies' },
          ]}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-32 md:px-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-full max-w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-900/20 to-transparent blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/50 px-4 py-1.5">
            <Info size={14} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Transparency First
            </span>
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
            Clear policies for a <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              transparent adoption journey
            </span>
          </h1>
          <p className="text-lg leading-relaxed text-slate-400">
            We operate with clarity and care so every family knows exactly what to expect. Our
            policies live on two dedicated pages below.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Link
            href="/privacy"
            className="group flex flex-col rounded-[2rem] border border-slate-800 bg-[#151e32] p-8 transition-all duration-300 hover:border-slate-600 hover:bg-[#1a253a] hover:shadow-xl hover:shadow-blue-900/5"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-[#0B1120] shadow-inner transition-transform duration-300 group-hover:scale-110">
              <Lock size={24} className="text-rose-400" />
            </div>
            <h2 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-blue-100">
              Privacy Policy
            </h2>
            <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400">
              What information we collect from inquiries and reservations, which services (Meta,
              Google, Stripe, PayPal, and more) may process it, and how to request access or
              deletion.
            </p>
            <span className="flex items-center gap-1 text-sm font-semibold text-orange-400">
              Read Privacy Policy <ArrowRight size={16} />
            </span>
          </Link>

          <Link
            href="/terms"
            className="group flex flex-col rounded-[2rem] border border-slate-800 bg-[#151e32] p-8 transition-all duration-300 hover:border-slate-600 hover:bg-[#1a253a] hover:shadow-xl hover:shadow-blue-900/5"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-[#0B1120] shadow-inner transition-transform duration-300 group-hover:scale-110">
              <ShieldCheck size={24} className="text-green-400" />
            </div>
            <h2 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-blue-100">
              Terms of Service &amp; Deposit Terms
            </h2>
            <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400">
              How reservations work, the $300 deposit, our health guarantee, delivery/pickup, and
              refund terms.
            </p>
            <span className="flex items-center gap-1 text-sm font-semibold text-orange-400">
              Read Terms of Service <ArrowRight size={16} />
            </span>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-[#1E293B]/30 p-4 text-sm text-slate-400">
          <CreditCard size={18} className="text-slate-300" />
          Payments are processed securely through Stripe and PayPal.
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-3xl px-6 text-center">
        <p className="text-sm text-slate-500">
          Have a specific situation not covered here?{' '}
          <Link href="/contact" className="text-orange-400 hover:underline">
            Contact us
          </Link>{' '}
          to discuss.
        </p>
      </div>
    </div>
  );
}
