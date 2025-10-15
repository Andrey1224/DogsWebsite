import Link from "next/link";

export function AboutPreview() {
  return (
    <section
      id="about-preview"
      className="border-t border-border bg-gradient-to-b from-bg to-card/30 py-16"
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">
              About the breeder
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              A family-run program built on trust and care
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Exotic Bulldog Level is a boutique breeder in Alabama focused on producing
              well-tempered French and English bulldogs. Our program blends veterinary best
              practices with genuine love for the breed, ensuring every puppy is health-screened,
              socialized, and ready to thrive in their forever home.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-accent-aux/40 px-5 py-2.5 text-sm font-semibold text-accent-aux transition hover:bg-[color:var(--hover)]"
            >
              Learn more about us
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
      </div>
    </section>
  );
}
