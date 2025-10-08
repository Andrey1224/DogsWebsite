export const metadata = {
  title: "About Exotic Bulldog Level",
  description:
    "Learn about Exotic Bulldog Level’s health-first breeding program for French and English bulldogs in Alabama.",
};

const pillars = [
  {
    title: "Health-first philosophy",
    description:
      "All sires and dams are DNA tested, OFA screened, and paired to reduce hereditary risks while promoting healthy confirmation.",
  },
  {
    title: "Enrichment-driven raising",
    description:
      "Puppies experience Early Neurological Stimulation, socialization with children, and crate conditioning before they go home.",
  },
  {
    title: "Lifetime breeder support",
    description:
      "Families receive onboarding guides, nutrition plans, and direct access to our team for health and training questions.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-12">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">About</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          A boutique breeding program built on trust, transparency, and care
        </h1>
        <p className="text-sm text-muted">
          Exotic Bulldog Level is a family-run breeder in Alabama focused on producing well-tempered
          French and English bulldogs. Our program blends veterinary best practices with genuine love
          for the breed, ensuring every puppy is ready to thrive in their forever home.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-3">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-text">
              {pillar.title}
            </h2>
            <p className="mt-3 text-sm text-muted">{pillar.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-text">Our facility</h2>
          <p className="text-sm text-muted">
            Puppies are raised in-home with dedicated nursery and play spaces. We maintain
            HEPA-filtration, daily sanitation routines, and climate control tailored to brachycephalic
            breeds. Each litter has supervised outdoor time and early leash introduction.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-text">Veterinary partners</h2>
          <p className="text-sm text-muted">
            We collaborate with board-certified reproductive veterinarians in Montgomery and Birmingham.
            They handle progesterone timing, cesarean sections when necessary, and newborn checkups, so
            every bulldog starts life with a health advantage.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-accent/40 bg-[color:color-mix(in srgb, var(--accent) 18%, var(--bg))] p-6 text-sm text-accent-aux">
        <p className="font-semibold text-accent-aux">Schedule a kennel visit</p>
        <p className="mt-2">
          We host private, appointment-only visits in Montgomery, AL and offer live video walkthroughs
          for out-of-state families. Reach out through the contact bar or the form to book a time that
          works for you.
        </p>
      </section>
    </div>
  );
}
