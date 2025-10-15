import Image from "next/image";
import Link from "next/link";

const featuredReviews = [
  {
    id: "sarah-w",
    author: "Sarah W.",
    location: "Huntsville, AL",
    rating: 5,
    quote:
      "We picked up our French Bulldog, Charlie, in June and he's been the sweetest, healthiest puppy we've ever had. The whole process was transparent and stress-free — communication was excellent!",
    media: {
      url: "/reviews/sarah-charlie.webp",
      alt: "French Bulldog Charlie with owner Sarah W. from Huntsville, AL",
    },
  },
  {
    id: "mark-lisa-p",
    author: "Mark & Lisa P.",
    location: "Birmingham, AL",
    rating: 5,
    quote:
      "Our English Bulldog Duke is doing amazing! He was already socialized and mostly potty trained. The deposit and pickup process were super easy and professional.",
    media: {
      url: "/reviews/mark-lisa-duke.webp",
      alt: "English Bulldog Duke with owners Mark and Lisa P. from Birmingham, AL",
    },
  },
  {
    id: "anthony-d",
    author: "Anthony D.",
    location: "Montgomery, AL",
    rating: 5,
    quote:
      "Top-notch breeder! You can tell they truly care for their dogs. My Frenchie, Tommy, settled in immediately and has the funniest personality.",
    media: {
      url: "/reviews/anthony-tommy.webp",
      alt: "French Bulldog Tommy with owner Anthony D. from Montgomery, AL",
    },
  },
];

export function ReviewsPreview() {
  return (
    <section id="reviews-preview" className="border-t border-border bg-card/50 py-16">
      <div className="mx-auto max-w-5xl px-6">
        <header className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">
            What families say
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Happy families, healthy puppies
          </h2>
          <p className="mt-3 text-sm text-muted">
            Real stories from bulldog owners across Alabama and the Southeast.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3 md:overflow-visible overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
          {featuredReviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg snap-center min-w-[85vw] md:min-w-0"
            >
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-text">{review.author}</p>
                  <p className="text-xs uppercase tracking-wide text-muted">{review.location}</p>
                </div>
                <div className="flex items-center gap-0.5 text-sm text-accent-aux" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} aria-hidden="true">
                      {index < review.rating ? "★" : "☆"}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted line-clamp-4">
                &ldquo;{review.quote}&rdquo;
              </p>
              {review.media && (
                <div className="overflow-hidden rounded-2xl border border-border">
                  <Image
                    src={review.media.url}
                    alt={review.media.alt}
                    width={400}
                    height={300}
                    className="h-48 w-full object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 400px"
                  />
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--btn-bg)] px-6 py-3 text-sm font-semibold text-[color:var(--btn-text)] shadow-lg transition hover:brightness-105"
          >
            Read all reviews
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
