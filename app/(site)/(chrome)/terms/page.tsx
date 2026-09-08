import Link from 'next/link';
import {
  CreditCard,
  ShieldCheck,
  Plane,
  RefreshCw,
  FileText,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { getMerchantReturnPolicySchema } from '@/lib/seo/structured-data';

export const metadata = buildMetadata({
  title: 'Terms of Service & Deposit Terms',
  description:
    "Exotic Bulldog Legacy's reservation process, $300 deposit terms, health guarantee, delivery/pickup, and refund policies.",
  path: '/terms',
});

const sections = [
  {
    id: 1,
    title: 'How a Reservation Works',
    icon: CheckCircle2,
    iconColor: 'text-orange-400',
    content: (
      <>
        Reserving a puppy is not an instant, self-serve checkout. It follows this sequence:
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>You send us an inquiry about a specific puppy.</li>
          <li>We reach out to connect with you.</li>
          <li>We schedule a video call or in-person visit.</li>
          <li>We confirm you as the buyer and confirm the puppy is still available.</li>
          <li>You receive and sign our adoption contract.</li>
          <li>
            Only after your contract is signed do you place the{' '}
            <span className="font-bold text-white">$300 reservation deposit</span>.
          </li>
          <li>The remaining balance is paid per the terms in your signed contract.</li>
        </ol>
        A puppy is only considered reserved for you once we have confirmed your application —
        submitting an inquiry or scheduling a call does not, by itself, reserve a puppy.
      </>
    ),
  },
  {
    id: 2,
    title: 'Deposit Policy',
    icon: CreditCard,
    iconColor: 'text-orange-400',
    content: (
      <>
        A <span className="font-bold text-white">$300 deposit</span> reserves your selected puppy
        once we&apos;ve confirmed your application and applies to the final balance. Because we
        pause all other inquiries for that puppy, deposits are non-refundable once paid. If your
        timing changes, we can transfer the deposit to another available puppy or upcoming litter by
        mutual agreement. The remaining balance is due as outlined in your signed contract.
      </>
    ),
  },
  {
    id: 3,
    title: 'Health Guarantee',
    icon: ShieldCheck,
    iconColor: 'text-green-400',
    content: (
      <>
        Every puppy receives a comprehensive vet exam, age-appropriate vaccinations, and a
        microchip. We guarantee against life-threatening congenital conditions for{' '}
        <span className="font-bold text-white">12 months</span> and require notification within 48
        hours of detection. Health records are provided when applicable to your puppy; ask us for
        available parent health-testing documentation. Learn more in our{' '}
        <Link
          href="/blog/choose-healthy-bulldog-puppy-health-tests"
          className="text-orange-400 hover:underline"
        >
          DNA &amp; Health Tests Guide
        </Link>
        .
      </>
    ),
  },
  {
    id: 4,
    title: 'Delivery & Pickup',
    icon: Plane,
    iconColor: 'text-blue-400',
    content: (
      <>
        Pickup takes place in Falkville, AL by appointment.{' '}
        <span className="font-bold text-white">Flight nanny transport</span> is available across the
        Southeast; travel fees are quoted at cost and must be paid prior to departure. A signed
        contract is required before pickup or delivery is scheduled.
      </>
    ),
  },
  {
    id: 5,
    title: 'Refunds & Exchanges',
    icon: RefreshCw,
    iconColor: 'text-purple-400',
    content: (
      <>
        Once reserved, refunds are not provided unless a licensed veterinarian documents a health
        concern prior to pickup. In that case, we offer a{' '}
        <span className="font-bold text-white">replacement puppy</span> from the next available
        litter or a full deposit return, at our discretion in discussion with you.
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
        Adoption contracts, medical records, and AKC paperwork (when applicable to your puppy) are
        compiled in a <span className="font-bold text-white">secure client portal</span> before
        go-home day. Co-ownership requests are reviewed on a case-by-case basis.
      </>
    ),
  },
];

export default function TermsPage() {
  const returnPolicySchema = getMerchantReturnPolicySchema({
    name: 'Exotic Bulldog Legacy Deposit & Puppy Return Policy',
    days: 0,
    fees: 'https://schema.org/NonRefundable',
    category: 'https://schema.org/MerchantReturnNotPermitted',
    method: 'https://schema.org/ReturnInStore',
  });

  return (
    <div className="min-h-screen bg-[#0B1120] pb-20 font-sans text-white">
      <div className="sr-only">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Terms of Service', href: '/terms' },
          ]}
        />
      </div>
      <JsonLd id="return-policy" data={returnPolicySchema} />

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-32 md:px-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-full max-w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-900/20 to-transparent blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/50 px-4 py-1.5">
            <Info size={14} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Terms of Service
            </span>
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
            Deposit terms &amp; the <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              reservation process
            </span>
          </h1>
          <p className="text-lg leading-relaxed text-slate-400">
            How reservations, deposits, delivery, and our health guarantee work — in plain language,
            before you apply.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <article
                key={section.id}
                id={section.id === 4 ? 'delivery' : undefined}
                className="group rounded-[2rem] border border-slate-800 bg-[#151e32] p-8 transition-all duration-300 hover:border-slate-600 hover:bg-[#1a253a] hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div className="flex items-start gap-6">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-800 bg-[#0B1120] shadow-inner transition-transform duration-300 group-hover:scale-110">
                    <IconComponent size={24} className={section.iconColor} />
                  </div>
                  <div>
                    <h2 className="mb-3 text-xl font-bold text-white transition-colors group-hover:text-blue-100">
                      {section.title}
                    </h2>
                    <div className="text-sm leading-relaxed text-slate-400">{section.content}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-3xl px-6 text-center">
        <p className="text-sm text-slate-500">
          These terms are part of our legal contract, finalized in writing before a deposit is
          taken.
          <br className="hidden md:block" />
          Have a specific situation not covered here?{' '}
          <Link href="/contact" className="text-orange-400 hover:underline">
            Contact us
          </Link>{' '}
          to discuss. See also our{' '}
          <Link href="/privacy" className="text-orange-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
