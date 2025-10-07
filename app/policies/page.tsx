export const metadata = {
  title: "Policies | Exotic Bulldog Level",
  description:
    "Deposit, health guarantee, transportation, and refund policies for Exotic Bulldog Level puppies.",
};

const sections = [
  {
    heading: "Deposits",
    body: `A $300 non-refundable deposit reserves your chosen puppy for 7 days while we complete health
checks and contract paperwork. If timelines shift due to vet recommendations, we can transfer the deposit to another puppy or upcoming litter.`,
  },
  {
    heading: "Health guarantee",
    body: `Every puppy goes home dewormed, vaccinated per age, microchipped, and accompanied by a vet
health certificate. We guarantee against life-threatening congenital conditions for 12 months with
coverage validated by a licensed veterinarian's findings.`,
  },
  {
    heading: "Transportation",
    body: `Pick-up is available in Montgomery, AL. We can coordinate ground delivery within neighboring
states or flight nanny services for cross-country placements. Delivery fees are calculated at cost and due prior to transport.`,
  },
  {
    heading: "Spay/neuter & breeding",
    body: `All puppies are placed on companion contracts unless a specific breeding agreement is signed.
Companion homes agree to spay/neuter by 18 months and provide proof to maintain health coverage.`,
  },
  {
    heading: "Returns & rehoming",
    body: `If circumstances change, we will always help rehome a puppy purchased from us. Deposits are non-refundable,
but we accept returns with written notice and collaborate on finding an appropriate placement to protect the dog.`,
  },
];

export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-12">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Policies</p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Clear policies for a transparent adoption journey
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          We operate with clarity and care so every family knows what to expect. Review the key policies
          below and reach out if you need clarification before reserving.
        </p>
      </header>

      <section className="space-y-6">
        {sections.map((section) => (
          <article
            key={section.heading}
            className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80"
          >
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {section.heading}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
              {section.body}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white/80 p-6 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80">
        <p className="font-semibold text-neutral-900 dark:text-neutral-100">Documents & contracts</p>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Adoption contracts, medical records, and AKC paperwork are compiled in a secure client portal
          before go-home day. Custom requests (co-ownership, guardian homes, or show prospects) are
          reviewed on a case-by-case basis.
        </p>
      </section>
    </div>
  );
}
