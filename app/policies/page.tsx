import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { getMerchantReturnPolicySchema } from "@/lib/seo/structured-data";

export const metadata = buildMetadata({
  title: "Policies | Exotic Bulldog Level",
  description:
    "Review Exotic Bulldog Level’s deposit, health guarantee, transportation, and return policies before reserving a French or English bulldog.",
  path: "/policies",
});

const sections = [
  {
    heading: "Deposit policy",
    body: `A $300 deposit reserves your selected puppy and is applied to the final balance. Because we pause all other inquiries, deposits are non-refundable. If schedules change, we can transfer the deposit to another available or upcoming puppy by mutual agreement.`,
  },
  {
    heading: "Refunds & exchanges",
    body: `Once a puppy is reserved, refunds are not provided unless a licensed veterinarian documents a health concern prior to pickup. In that case we will offer a replacement puppy from the next available litter or return the deposit.`,
  },
  {
    heading: "Health guarantee",
    body: `Every puppy receives a comprehensive exam from our licensed veterinarian, age-appropriate vaccinations, deworming, and microchip. We guarantee against life-threatening congenital conditions for 12 months and require notification within 48 hours of detection.`,
  },
  {
    heading: "Delivery & pickup",
    body: `Pickup takes place in Montgomery, Alabama by appointment only. Courier delivery or flight nanny transport is available across the Southeast; travel fees are quoted at cost and must be paid before departure.`,
  },
  {
    heading: "Privacy & payments",
    body: `We process payments exclusively through Stripe and PayPal—no wire transfers or cash apps. Customer contact data is used only for reservation updates, contracts, and veterinary records and is never sold or shared with third parties.`,
  },
];

export default function PoliciesPage() {
  const returnPolicySchema = getMerchantReturnPolicySchema({
    name: "Exotic Bulldog Level Deposit & Puppy Return Policy",
    days: 0,
    fees: "https://schema.org/NonRefundable",
    category: "https://schema.org/MerchantReturnNotPermitted",
    method: "https://schema.org/ReturnInStore",
  });

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Policies", href: "/policies" },
        ]}
      />
      <JsonLd id="return-policy" data={returnPolicySchema} />
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">Policies</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Clear policies for a transparent adoption journey
        </h1>
        <p className="text-sm text-muted">
          We operate with clarity and care so every family knows what to expect. Review the key policies
          below and reach out if you need clarification before reserving.
        </p>
      </header>

      <section className="space-y-6">
        {sections.map((section) => (
          <article
            key={section.heading}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-text">
              {section.heading}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm text-muted">
              {section.body}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 text-sm shadow-sm">
        <p className="font-semibold text-text">Documents & contracts</p>
        <p className="mt-2 text-muted">
          Adoption contracts, medical records, and AKC paperwork are compiled in a secure client portal
          before go-home day. Custom requests (co-ownership, guardian homes, or show prospects) are
          reviewed on a case-by-case basis.
        </p>
      </section>
    </div>
  );
}
