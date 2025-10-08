import Link from "next/link";

const highlights = [
  {
    title: "Health-first standards",
    description:
      "AKC pedigrees, OFA screenings, and transparent vet documentation for every sire and dam.",
  },
  {
    title: "Curated matches",
    description:
      "Filter by breed, color, and temperament to find the bulldog that fits your family routine.",
  },
  {
    title: "Guided ownership",
    description:
      "Personal support before and after adoption, plus secure deposits handled via Stripe & PayPal.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-20 pt-16 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">
            Exotic Bulldog Level
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            Trusted French & English bulldogs, raised with southern warmth
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Discover a curated catalog of champion-line bulldogs bred for health, temperament, and
            lifelong companionship. Review pedigrees, chat with our team, and reserve your perfect
            match with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/puppies"
              className="rounded-full bg-[color:var(--btn-bg)] px-6 py-3 text-sm font-semibold text-[color:var(--btn-text)] shadow-lg transition hover:brightness-105"
            >
              View available puppies
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-text transition hover:bg-[color:var(--hover)]"
            >
              Schedule a video call
            </Link>
          </div>
        </div>
        <div className="relative mt-4 h-72 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-[url('https://images.exoticbulldog.dev/hero/english-bulldog.jpg')] bg-cover bg-center shadow-xl sm:mt-0">
          <span className="sr-only">French and English bulldogs relaxing on a sofa</span>
        </div>
      </section>

      <section className="border-t border-border bg-card/80 py-16 backdrop-blur">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 sm:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-[0_25px_60px_rgba(13,26,68,0.08)]"
            >
              <h2 className="text-lg font-semibold text-text">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-footer py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-text">
                What to expect next
              </h2>
              <p className="mt-2 text-sm text-muted">
                Sprint 1 focuses on catalogs and detail pages. Keep an eye on releases as we connect
                live chats, analytics, and deposit flows in upcoming sprints.
              </p>
            </div>
            <Link
              href="/puppies"
              className="rounded-full border border-accent-aux/40 px-5 py-2 text-sm font-semibold text-accent-aux transition hover:bg-[color:var(--hover)]"
            >
              Browse the catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
