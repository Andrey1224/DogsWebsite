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
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">
            Exotic Bulldog Level
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-50">
            Trusted French & English bulldogs, raised with southern warmth
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
            Discover a curated catalog of champion-line bulldogs bred for health, temperament, and
            lifelong companionship. Review pedigrees, chat with our team, and reserve your perfect
            match with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/puppies"
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/40 transition hover:bg-emerald-500"
            >
              View available puppies
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Schedule a video call
            </Link>
          </div>
        </div>
        <div className="relative mt-4 h-72 w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-[url('https://images.exoticbulldog.dev/hero/english-bulldog.jpg')] bg-cover bg-center shadow-2xl shadow-emerald-200/40 sm:mt-0 dark:border-neutral-800 dark:shadow-none">
          <span className="sr-only">French and English bulldogs relaxing on a sofa</span>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white/70 py-16 backdrop-blur dark:border-neutral-900 dark:bg-neutral-950/60">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 sm:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-neutral-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900/80"
            >
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-neutral-50 py-14 dark:bg-neutral-900">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                What to expect next
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                Sprint 1 focuses on catalogs and detail pages. Keep an eye on releases as we connect
                live chats, analytics, and deposit flows in upcoming sprints.
              </p>
            </div>
            <Link
              href="/puppies"
              className="rounded-full border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
            >
              Browse the catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
