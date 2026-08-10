import Link from 'next/link';
import { Lock, Info, Database, Users2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { buildMetadata } from '@/lib/seo/metadata';
import { BUSINESS_PROFILE } from '@/lib/config/business';
import { CONTACT_DETAILS } from '@/lib/config/contact';

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description:
    'How Exotic Bulldog Legacy collects, uses, and shares information from inquiries, reservations, and site analytics.',
  path: '/privacy',
});

const sections = [
  {
    id: 1,
    title: 'What We Collect',
    icon: Database,
    iconColor: 'text-rose-400',
    content: (
      <>
        When you submit our contact form, we collect the{' '}
        <span className="font-bold text-white">name, email, phone (optional), and message</span> you
        provide, along with your IP address and browser information (standard for any web form
        submission). When you reserve a puppy, we collect the{' '}
        <span className="font-bold text-white">
          name, email, and phone Stripe or PayPal shares with us
        </span>{' '}
        after checkout, plus the payment&apos;s transaction reference, amount, and status. Public
        review submissions store the name and general location you provide.
      </>
    ),
  },
  {
    id: 2,
    title: 'Payments — What We Do and Don’t Store',
    icon: Lock,
    iconColor: 'text-orange-400',
    content: (
      <>
        We process payments exclusively through{' '}
        <span className="font-bold text-white">Stripe and PayPal</span>—no wire transfers. We do not
        process or store your full card number or security code; card entry happens directly on
        Stripe&apos;s or PayPal&apos;s own secure checkout, never on our servers. We do store the
        transaction reference (a payment/order ID), the amount, currency, and payment status, and
        the billing contact details (name, email, phone) that Stripe or PayPal share with us after a
        successful payment — this is how we confirm your reservation and keep accurate records.
      </>
    ),
  },
  {
    id: 3,
    title: 'Services That May Process Your Data',
    icon: Users2,
    iconColor: 'text-blue-400',
    content: (
      <>
        Depending on how you use the site and your cookie choice, the following services may process
        data on our behalf:
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <span className="font-bold text-white">Meta Pixel &amp; Meta Conversions API</span> —
            advertising measurement (e.g. page views, form submissions), only after you click
            Accept.
          </li>
          <li>
            <span className="font-bold text-white">Google Analytics</span> — site usage measurement;
            runs in a cookieless mode before you choose, and with cookies after you click Accept.
          </li>
          <li>
            <span className="font-bold text-white">Vercel Analytics &amp; hosting</span> —
            aggregated, cookieless traffic statistics, and the infrastructure that serves this site.
          </li>
          <li>
            <span className="font-bold text-white">Stripe &amp; PayPal</span> — payment processing.
          </li>
          <li>
            <span className="font-bold text-white">hCaptcha</span> — spam and bot prevention on our
            forms.
          </li>
          <li>
            <span className="font-bold text-white">Resend</span> — delivers our confirmation and
            notification emails.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 4,
    title: 'Cookie & Analytics Policy',
    icon: Info,
    iconColor: 'text-cyan-400',
    content: (
      <>
        <span className="font-bold text-white">Vercel Web Analytics</span> runs on every visit
        without cookies and reports aggregated, site-wide statistics — it is not used to build an
        individual profile of your visit.
        <br />
        <br />
        <span className="font-bold text-white">Google Analytics</span> loads on every visit. Before
        you make a choice, it uses cookieless measurement: no analytics or advertising cookies are
        set, but like any normal web request, this traffic can technically include your IP address,
        browser/user-agent string, referring page, and device/screen parameters. If you click
        Accept, analytics and advertising cookies (such as <code>_ga</code> and <code>_gid</code>)
        and Google&rsquo;s advertising features are enabled. Clicking Decline keeps Google Analytics
        in cookieless mode for current and future visits — no analytics or advertising cookies are
        set.
        <br />
        <br />
        <span className="font-bold text-white">Meta Pixel and Meta Conversions API</span> are not
        loaded and do not run until you click Accept. Clicking Decline keeps Meta fully disabled.
        <br />
        <br />
        You can change your choice at any time using the{' '}
        <span className="font-bold text-white">Privacy settings</span> link in the footer, which
        reopens the consent banner and resets Google Analytics to cookieless mode and disables Meta.
        This clears our stored consent preference; removal of previously set analytics/advertising
        cookies from your browser is not guaranteed to happen immediately.
      </>
    ),
  },
  {
    id: 5,
    title: 'Access & Deletion Requests',
    icon: Users2,
    iconColor: 'text-green-400',
    content: (
      <>
        To ask what information we hold about you, or to request a correction or deletion, contact
        us at{' '}
        <a
          href={`mailto:${CONTACT_DETAILS.email.address}`}
          className="font-bold text-white hover:underline"
        >
          {CONTACT_DETAILS.email.address}
        </a>{' '}
        or call{' '}
        <a
          href={`tel:${CONTACT_DETAILS.phone.e164}`}
          className="font-bold text-white hover:underline"
        >
          {CONTACT_DETAILS.phone.display}
        </a>
        . We&apos;ll respond within a reasonable time. Some records (e.g. completed payment
        transactions) may need to be retained for accounting or legal reasons even after a deletion
        request.
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] pb-20 font-sans text-white">
      <div className="sr-only">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Privacy Policy', href: '/privacy' },
          ]}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-32 md:px-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-full max-w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-900/20 to-transparent blur-[100px]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/50 px-4 py-1.5">
            <Info size={14} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Privacy Policy
            </span>
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
            What we collect, and <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              how it&apos;s used
            </span>
          </h1>
          <p className="text-lg leading-relaxed text-slate-400">
            {BUSINESS_PROFILE.name} is a small, direct operation — here is a plain-language account
            of what data we collect, who else may process it, and how to reach us about it.
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
          Questions about this policy or a specific situation not covered here?{' '}
          <Link href="/contact" className="text-orange-400 hover:underline">
            Contact us
          </Link>
          . See also our{' '}
          <Link href="/terms" className="text-orange-400 hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
