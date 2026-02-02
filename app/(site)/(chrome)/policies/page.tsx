// New UI implementation - dark theme only
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Plane,
  FileText,
  RefreshCw,
  Lock,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { getMerchantReturnPolicySchema } from '@/lib/seo/structured-data';

export const metadata = buildMetadata({
  title: 'Policies | Exotic Bulldog Legacy',
  description:
    "Review Exotic Bulldog Legacy's deposit, health guarantee, transportation, and return policies before reserving a French or English bulldog.",
  path: '/policies',
});

const policies = [
  {
    id: 1,
    title: 'Deposit Policy',
    icon: CreditCard,
    iconColor: 'text-orange-400',
    content: (
      <>
        A <span className="font-bold text-white">$300 deposit</span> reserves your selected puppy
        and is applied to the final balance. Because we pause all other inquiries, deposits are
        non-refundable. If schedules change, we can transfer the deposit to another litter by mutual
        agreement.
      </>
    ),
  },
  {
    id: 2,
    title: 'Health Guarantee',
    icon: ShieldCheck,
    iconColor: 'text-green-400',
    content: (
      <>
        Every puppy receives a comprehensive vet exam, age-appropriate vaccinations, and a
        microchip. We guarantee against life-threatening congenital conditions for{' '}
        <span className="font-bold text-white">12 months</span> and require notification within 48
        hours of detection.
      </>
    ),
  },
  {
    id: 3,
    title: 'Delivery & Pickup',
    icon: Plane,
    iconColor: 'text-blue-400',
    content: (
      <>
        Pickup takes place in Montgomery, AL by appointment.{' '}
        <span className="font-bold text-white">Flight nanny transport</span> is available across the
        Southeast; travel fees are quoted at cost and must be paid prior to departure.
      </>
    ),
  },
  {
    id: 4,
    title: 'Refunds & Exchanges',
    icon: RefreshCw,
    iconColor: 'text-purple-400',
    content: (
      <>
        Once reserved, refunds are not provided unless a licensed veterinarian documents a health
        concern prior to pickup. In that case, we offer a{' '}
        <span className="font-bold text-white">replacement puppy</span> from the next available
        litter or a full deposit return.
      </>
    ),
  },
  {
    id: 5,
    title: 'Privacy & Payments',
    icon: Lock,
    iconColor: 'text-rose-400',
    content: (
      <>
        We process payments exclusively through{' '}
        <span className="font-bold text-white">Stripe and PayPal</span>—no wire transfers. Customer
        data is used only for contracts and vet records and is never shared with third parties.
      </>
    ),
  },
  {
    id: 6,
    title: 'Documents & Contracts',
    icon: FileText,
    iconColor: 'text-yellow-400',
    content: (
      <>
        Adoption contracts, medical records, and AKC paperwork are compiled in a{' '}
        <span className="font-bold text-white">secure client portal</span> before go-home day.
        Co-ownership requests are reviewed on a case-by-case basis.
      </>
    ),
  },
];

export default function PoliciesPage() {
  const returnPolicySchema = getMerchantReturnPolicySchema({
    name: 'Exotic Bulldog Legacy Deposit & Puppy Return Policy',
    days: 0,
    fees: 'https://schema.org/NonRefundable',
    category: 'https://schema.org/MerchantReturnNotPermitted',
    method: 'https://schema.org/ReturnInStore',
  });

  return (
    <div className="min-h-screen bg-[#0B1120] pb-20 font-sans text-white">
      {/* SEO Components */}
      <div className="sr-only">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Policies', href: '/policies' },
          ]}
        />
      </div>
      <JsonLd id="return-policy" data={returnPolicySchema} />

      {/* Header */}
      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-32 md:px-12">
        {/* Abstract Background */}
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
            We operate with clarity and care so every family knows exactly what to expect. No hidden
            clauses, just honest commitments.
          </p>
        </div>
      </div>

      {/* Trust Signals Bar */}
      <div className="mx-auto mb-16 max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-[#1E293B]/30 p-4">
            <CheckCircle2 className="text-green-400" size={20} />
            <span className="font-semibold text-slate-300">AKC Registered</span>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-[#1E293B]/30 p-4">
            <CheckCircle2 className="text-green-400" size={20} />
            <span className="font-semibold text-slate-300">Vet Certified</span>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-[#1E293B]/30 p-4">
            <CheckCircle2 className="text-green-400" size={20} />
            <span className="font-semibold text-slate-300">Secure Payments</span>
          </div>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {policies.map((policy) => {
            const IconComponent = policy.icon;
            return (
              <article
                key={policy.id}
                className="group rounded-[2rem] border border-slate-800 bg-[#151e32] p-8 transition-all duration-300 hover:border-slate-600 hover:bg-[#1a253a] hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div className="flex items-start gap-6">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-[#0B1120] shadow-inner transition-transform duration-300 group-hover:scale-110">
                    <IconComponent size={24} className={policy.iconColor} />
                  </div>
                  <div>
                    <h2 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-blue-100">
                      {policy.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-400">{policy.content}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mx-auto mt-20 max-w-3xl px-6 text-center">
        <p className="text-sm text-slate-500">
          These policies are part of our legal contract provided upon reservation.
          <br className="hidden md:block" />
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
