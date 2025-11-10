import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { getLocalBusinessSchema } from "@/lib/seo/structured-data";

type Review = {
  id: string;
  author: string;
  location: string;
  visitDate: string;
  rating: number;
  quote: string;
  media?: {
    type: "image" | "video";
    url: string;
    alt: string;
  };
};

const reviews: Review[] = [
  {
    id: "sarah-w",
    author: "Sarah W.",
    location: "Huntsville, AL",
    visitDate: "2025-06-18",
    rating: 5,
    quote:
      "We picked up our French Bulldog, Charlie, in June and he’s been the sweetest, healthiest puppy we’ve ever had. The whole process was transparent and stress-free — communication was excellent!",
    media: {
      type: "image",
      url: "/reviews/sarah-charlie.webp",
      alt: "Sarah with French Bulldog Charlie",
    },
  },
  {
    id: "mark-lisa-p",
    author: "Mark & Lisa P.",
    location: "Birmingham, AL",
    visitDate: "2025-07-03",
    rating: 5,
    quote:
      "Our English Bulldog Duke is doing amazing! He was already socialized and mostly potty trained. The deposit and pickup process were super easy and professional.",
    media: {
      type: "image",
      url: "/reviews/mark-lisa-duke.webp",
      alt: "Mark and Lisa with their English Bulldog Duke",
    },
  },
  {
    id: "jessica-m",
    author: "Jessica M.",
    location: "Nashville, TN",
    visitDate: "2025-08-02",
    rating: 5,
    quote:
      "I was nervous about buying online, but Exotic Bulldog Legacy made everything smooth. We received videos and updates right up until delivery day. Bella arrived happy, healthy, and ready to cuddle.",
  },
  {
    id: "anthony-d",
    author: "Anthony D.",
    location: "Montgomery, AL",
    visitDate: "2025-05-27",
    rating: 5,
    quote:
      "Top-notch breeder! You can tell they truly care for their dogs. My Frenchie, Tommy, settled in immediately and has the funniest personality.",
    media: {
      type: "image",
      url: "/reviews/anthony-tommy.webp",
      alt: "Anthony with French Bulldog Tommy",
    },
  },
  {
    id: "rachel-k",
    author: "Rachel K.",
    location: "Atlanta, GA",
    visitDate: "2025-07-22",
    rating: 5,
    quote:
      "We drove from Georgia because the quality of their bulldogs is worth it. The one-year health guarantee gave us confidence, and our vet said our pup was in perfect condition.",
  },
  {
    id: "cameron-h",
    author: "Cameron H.",
    location: "Decatur, AL",
    visitDate: "2025-09-05",
    rating: 5,
    quote:
      "I loved how easy it was to reserve online. PayPal worked perfectly and the confirmation emails arrived instantly. Milo is already the star of our neighborhood!",
    media: {
      type: "image",
      url: "/reviews/cameron-milo.webp",
      alt: "Cameron holding bulldog puppy Milo",
    },
  },
];

export const metadata = buildMetadata({
  title: "Reviews | Exotic Bulldog Legacy",
  description:
    "Read authentic reviews from Exotic Bulldog Legacy families across Alabama, Georgia, and Tennessee.",
  path: "/reviews",
});

export default function ReviewsPage() {
  const localBusiness = getLocalBusinessSchema();
  const businessId =
    (localBusiness as { ["@id"]?: string })["@id"] ?? `${localBusiness.url.replace(/\/$/, "")}#localbusiness`;

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: reviews.map((review, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: review.author,
        },
        datePublished: review.visitDate,
        reviewBody: review.quote,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
        },
        itemReviewed: {
          "@id": businessId,
        },
      },
    })),
  };

  const aggregateSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": businessId,
    name: localBusiness.name,
    url: localBusiness.url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: reviews.length,
    },
  };

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-6 py-12">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Reviews", href: "/reviews" },
        ]}
      />
      <JsonLd id="reviews-itemlist" data={reviewSchema} />
      <JsonLd id="reviews-aggregate" data={aggregateSchema} />

      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">Reviews</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Families who chose Exotic Bulldog Legacy
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-muted">
          From first kennel visits to flight nanny hand-offs, our team stays involved at every step of the adoption
          journey. These stories highlight the transparent, health-first experience we deliver across the Southeast.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-text">{review.author}</p>
                <p className="text-xs uppercase tracking-wide text-muted">{review.location}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-accent-aux">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} aria-hidden="true">
                    {index < review.rating ? "★" : "☆"}
                  </span>
                ))}
                <span className="sr-only">{review.rating} out of 5 stars</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              “{review.quote}”
            </p>
            {review.media ? (
              <div className="overflow-hidden rounded-2xl border border-border">
                {review.media.type === "image" ? (
                  <Image
                    src={review.media.url}
                    alt={review.media.alt}
                    width={640}
                    height={400}
                    className="h-64 w-full object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
                  />
                ) : (
                  <div className="relative aspect-video">
                    <iframe
                      src={review.media.url}
                      title={review.media.alt}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                )}
              </div>
            ) : null}
            <div className="text-xs text-muted">
              Visited{" "}
              {new Date(review.visitDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 text-sm shadow-sm">
        <p className="font-semibold text-text">Ready to plan your bulldog match?</p>
        <p className="mt-2 text-muted">
          Share your wish list and we’ll send temperament videos, health records, and timing guidance tailored to your
          household.
        </p>
        <div className="mt-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--btn-bg)] px-4 py-2 text-sm font-semibold text-[color:var(--btn-text)] transition hover:brightness-105"
          >
            Contact the team
          </Link>
        </div>
      </section>
    </div>
  );
}
