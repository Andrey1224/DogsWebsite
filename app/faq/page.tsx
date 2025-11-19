import Link from 'next/link';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { getFaqSchema } from '@/lib/seo/structured-data';

const faqItems = [
  {
    question: 'How do I place a deposit?',
    answer:
      'Open the puppy’s detail page and tap Reserve with Stripe or PayPal. The $300 deposit immediately marks the puppy as reserved while we finalize your contract and pickup timeline.',
  },
  {
    question: 'Is the deposit refundable?',
    answer:
      'Deposits are non-refundable because we pause all other inquiries for that puppy. If your timing changes, we can transfer the deposit to another available or upcoming puppy by agreement.',
  },
  {
    question: 'What are the pickup and delivery options?',
    answer:
      'You can pick up in Montgomery by appointment or choose courier delivery. We partner with trusted ground transport and flight nannies; travel fees are quoted at cost and due prior to departure.',
  },
  {
    question: 'What documents come with the puppy?',
    answer:
      'Every puppy goes home with a licensed veterinary health certificate, vaccination and deworming record, microchip registration details, and a starter guide for nutrition and training.',
  },
  {
    question: 'Can we visit before reserving?',
    answer:
      'Yes. Kennel visits are available by appointment once you complete the inquiry form. We also provide live video walkthroughs for families who cannot travel.',
  },
  {
    question: 'How do I know the site is legitimate?',
    answer:
      'All payments are processed by Stripe or PayPal—never direct transfers. You’ll receive automated confirmations, contracts, and ongoing communication from our team for full peace of mind.',
  },
];

export const metadata = buildMetadata({
  title: 'Frequently Asked Questions | Exotic Bulldog Legacy',
  description:
    'Find answers about reserving, raising, and transporting French and English bulldog puppies from Exotic Bulldog Legacy.',
  path: '/faq',
});

export default function FaqPage() {
  const faqSchema = getFaqSchema(faqItems);

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-12">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'FAQ', href: '/faq' },
        ]}
      />
      <JsonLd id="faq-schema" data={faqSchema} />

      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">FAQ</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Frequently asked questions about our bulldog program
        </h1>
        <p className="text-sm text-muted">
          Explore the breeding standards, reservation process, and go-home preparation steps that
          guide every Exotic Bulldog Legacy placement. Reach out if you need details beyond these
          highlights.
        </p>
      </div>

      <section className="space-y-4">
        {faqItems.map((item) => (
          <article
            key={item.question}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <h2 className="text-lg font-semibold text-text">{item.question}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.answer}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 text-sm shadow-sm">
        <p className="font-semibold text-text">Still have a question?</p>
        <p className="mt-2 text-muted">
          We love connecting with future bulldog families.{' '}
          <Link href="/contact" className="font-semibold text-accent-aux underline">
            Contact us
          </Link>{' '}
          to schedule a kennel visit, video call, or to request additional health documentation.
        </p>
      </section>
    </div>
  );
}
