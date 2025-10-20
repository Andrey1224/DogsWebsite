import { Breadcrumbs } from "@/components/breadcrumbs";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "About Exotic Bulldog Level",
  description:
    "Learn about Exotic Bulldog Level’s health-first French and English bulldog breeding program in Montgomery, Alabama.",
  path: "/about",
});

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
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
        ]}
      />
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

      <section className="space-y-4 rounded-3xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-text">My journey into the world of bulldogs</h2>
        <div className="space-y-3 text-sm text-muted">
          <p>
            My love story with bulldogs began in the 1980s in Ukraine when my parents entrusted me with
            my first French Bulldog puppy. His name was Roman—wide-eyed, big-eared, and instantly the
            center of my world. From the moment he arrived, life felt different in the best possible way.
          </p>
          <p>
            Since then, French and English bulldogs have been woven into every season of my life. I cannot
            remember a time without them, and I often catch myself understanding their moods and needs
            faster than people’s. Their loyalty, emotional depth, and expressive personalities speak a
            language I have spent decades learning.
          </p>
          <p>
            Dog shows quickly became more than weekend outings—they were classrooms and community rolled
            into one. I invested countless hours learning from fellow breeders, refining husbandry
            practices, and building friendships rooted in a shared devotion to the breed. What began as an
            absorbing hobby evolved into a lifelong dedication to raising healthy, joyful, and beautiful
            bulldogs.
          </p>
          <p>
            Today I specialize in both French and English Bulldogs. I could talk about them for hours—their
            charm, quirks, soulful eyes, and playful spirits. I keep thousands of photos and videos and
            remember each dog by name because they are not simply pets; they are family. Breeding is not
            just my vocation—it is part of who I am, made possible by the unwavering support of God and my
            family.
          </p>
          <p>
            My goal is simple and profound: to raise healthy, happy, and stunning bulldogs that fill homes
            with the same joy Roman brought into mine. Every puppy that leaves our home carries that legacy
            of love forward.
          </p>
        </div>
      </section>

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
