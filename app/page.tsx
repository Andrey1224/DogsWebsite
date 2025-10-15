import Image from "next/image";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo/metadata";
import { AboutPreview } from "@/components/home/about-preview";
import { FaqPreview } from "@/components/home/faq-preview";
import { ReviewsPreview } from "@/components/home/reviews-preview";

export const metadata = buildMetadata({
  title: "Premium Bulldog Breeder in Alabama | Exotic Bulldog Level",
  description:
    "Discover French and English bulldog puppies raised with health-first standards, transparent pedigrees, and concierge ownership support in Montgomery, Alabama.",
  path: "/",
  image: "https://images.exoticbulldog.dev/hero/english-bulldog.jpg",
});

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
  const HERO_BLUR_DATA_URL =
    "data:image/webp;base64,UklGRlQBAABXRUJQVlA4IEgBAAAQCACdASooABsAPmUqj0WkIqEarfwAQAZEtgBOnKCp3vin0kYHgND/YJATZuuDAGkuJRRwYyXqy2jw6H5CcGwiBicy17fTEcAAAP6ilW9OHLZNo2xQNS0RM4xaI/dxLyfhpPwjpfHpuczC9xEeg8rQ464DYWkL2Xx3th+VF1+Debr9jE+tWvm51DfnwboUnlYOWCnm6oNpElxn5bEoN5DbSjsItcfeh7NzZFhJFl9WY5uwFGNM0vmT0x4ztGsqy01xzHIy4GZWGAJMIsHW5MdUJxsYRy86+qgyTZC4VjvQLScmuGePccUbroCFPwDLa5HbMEf1g4BOjjNONgvP/VptLpNlEi9CVQAz/OYUhstkcOJ8ndQsV59jOGjabqM7vOgYw6GyfbrM2dTr0JIz2X+loBgD1eOyng452NFz8BptkoiqU4GZcAAA";
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-20 pt-16 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">
            Premium Bulldog Breeder in Alabama
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
        <div className="relative mt-4 h-72 w-full max-w-md overflow-hidden rounded-3xl border border-border shadow-xl sm:mt-0">
          <Image
            src="/hero/hero-1600.webp"
            alt="Healthy French and English Bulldog puppies from Exotic Bulldog Level breeder in Alabama"
            fill
            priority
            placeholder="blur"
            blurDataURL={HERO_BLUR_DATA_URL}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 28rem"
          />
        </div>
      </section>

      {/* About Preview */}
      <AboutPreview />

      {/* Highlights Section */}
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

      {/* FAQ Preview */}
      <FaqPreview />

      {/* Reviews Preview */}
      <ReviewsPreview />

      {/* Call to Action Section */}
      <section className="border-t border-border bg-gradient-to-b from-bg to-card/30 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col gap-6 rounded-3xl border border-accent/40 bg-[color:color-mix(in_srgb,_var(--accent)_18%,_var(--bg))] p-8 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div>
              <h2 className="text-2xl font-semibold text-text">
                Ready to find your perfect bulldog?
              </h2>
              <p className="mt-2 text-sm text-muted">
                Browse our curated catalog of available puppies or schedule a kennel visit to meet
                our breeding families in person.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:flex-shrink-0">
              <Link
                href="/puppies"
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--btn-bg)] px-6 py-3 text-sm font-semibold text-[color:var(--btn-text)] shadow-lg transition hover:brightness-105"
              >
                View available puppies
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-text transition hover:bg-[color:var(--hover)]"
              >
                Schedule a visit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
