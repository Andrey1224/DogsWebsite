import Link from "next/link";

const topFaqs = [
  {
    question: "How do I place a deposit?",
    answer:
      "Open the puppy's detail page and tap Reserve with Stripe or PayPal. The $300 deposit immediately marks the puppy as reserved while we finalize your contract and pickup timeline.",
  },
  {
    question: "Is the deposit refundable?",
    answer:
      "Deposits are non-refundable because we pause all other inquiries for that puppy. If your timing changes, we can transfer the deposit to another available or upcoming puppy by agreement.",
  },
  {
    question: "What are the pickup and delivery options?",
    answer:
      "You can pick up in Montgomery by appointment or choose courier delivery. We partner with trusted ground transport and flight nannies; travel fees are quoted at cost and due prior to departure.",
  },
];

export function FaqPreview() {
  return (
    <section id="faq-preview" className="bg-bg py-16">
      <div className="mx-auto max-w-5xl px-6">
        <header className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">
            Quick answers
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Your most common questions, answered
          </h2>
          <p className="mt-3 text-sm text-muted">
            Get clarity on deposits, delivery, and the reservation process before you reach out.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {topFaqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="text-base font-semibold text-text">{faq.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-text transition hover:bg-[color:var(--hover)]"
          >
            See all FAQs
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
