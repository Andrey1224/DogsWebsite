import { Star, CheckCircle2, MapPin } from 'lucide-react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { ReviewCard } from '@/components/reviews/review-card';
import { ReviewForm } from '@/components/reviews/review-form';
import { getAggregate, getPublishedReviews } from '@/lib/reviews/queries';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Reviews | Exotic Bulldog Legacy',
  description: 'Read authentic reviews from Exotic Bulldog Legacy families across the Southeast.',
  path: '/reviews',
});

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-700/50 bg-[#1E293B]/50 p-4 backdrop-blur-sm">
      <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      </div>
    </div>
  );
}

export default async function ReviewsPage() {
  const publishedReviews = await getPublishedReviews();
  const aggregate = getAggregate(publishedReviews);

  const aggregateSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Exotic Bulldog Legacy',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: aggregate.averageRating || 0,
      reviewCount: aggregate.reviewCount,
    },
  };

  return (
    <main id="main-content" className="min-h-screen bg-[#0B1120] pb-20 font-sans text-white">
      {/* SEO - Hidden Breadcrumbs */}
      <div className="sr-only">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Reviews', href: '/reviews' },
          ]}
        />
      </div>
      <JsonLd id="reviews-aggregate" data={aggregateSchema} />

      {/* Header & Stats */}
      <div className="relative px-6 pb-12 pt-32 md:px-12">
        {/* Background Decor */}
        <div className="pointer-events-none absolute left-1/4 top-0 h-[600px] w-[800px] -translate-y-1/2 rounded-full bg-indigo-900/20 blur-[120px]" />

        <div className="relative z-10 mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-orange-400">
            Verified Reviews
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            Families who chose <br />
            <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              Exotic Bulldog Legacy
            </span>
          </h1>
          <p className="text-lg text-slate-400">
            From first kennel visits to flight nanny hand-offs, our team stays involved at every
            step. These stories highlight the transparent experience we deliver.
          </p>
        </div>

        {/* Stats Row */}
        <div className="mx-auto mb-20 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Average Rating"
            value="5.0 / 5.0"
            icon={<Star className="fill-orange-400" />}
          />
          <StatCard label="Happy Families" value="120+" icon={<CheckCircle2 />} />
          <StatCard label="States Served" value="14" icon={<MapPin />} />
        </div>
      </div>

      {/* Reviews Grid (Masonry) */}
      {publishedReviews.length > 0 ? (
        <div className="mx-auto mb-32 max-w-7xl px-6 md:px-12">
          <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
            {publishedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-auto mb-32 max-w-7xl px-6 md:px-12">
          <div className="rounded-3xl border border-dashed border-slate-700 bg-[#151e32] p-12 text-center">
            <p className="mb-2 text-xl font-bold text-white">No reviews published yet</p>
            <p className="text-slate-400">
              Once we approve the first story it will appear here. Share your experience below!
            </p>
          </div>
        </div>
      )}

      {/* Leave a Review Form Section */}
      <div className="relative mx-auto max-w-4xl px-6 md:px-12">
        <ReviewForm />
      </div>
    </main>
  );
}
