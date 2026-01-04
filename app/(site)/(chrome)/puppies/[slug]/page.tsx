import { notFound } from 'next/navigation';
import { Activity, ArrowLeft, MapPin, Star, Weight } from 'lucide-react';
import Link from 'next/link';

import { JsonLd } from '@/components/json-ld';
import { PuppyGallery } from '@/components/puppy-gallery';
import { PuppyCard } from '@/components/puppy-card';
import { StatsGrid } from '@/components/puppy-detail/stats-grid';
import { ParentCard } from '@/components/puppy-detail/parent-card';
import { HealthBadge } from '@/components/puppy-detail/health-badge';
import { getPuppiesWithRelations, getPuppyBySlug } from '@/lib/supabase/queries';
import { buildMetadata } from '@/lib/seo/metadata';
import { getProductSchema } from '@/lib/seo/structured-data';
import { ReserveButton } from './reserve-button';
import { getPuppyReservationState } from '@/lib/reservations/state';
import { calculateDepositAmount } from '@/lib/payments/deposit';

export const revalidate = 60;

function formatBreed(value?: string | null) {
  if (!value) return undefined;
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const puppy = await getPuppyBySlug(slug);

  if (!puppy) {
    return buildMetadata({
      title: 'Puppy not found | Exotic Bulldog Legacy',
      description: 'The requested bulldog could not be located. Explore available puppies instead.',
      path: `/puppies/${slug}`,
      noIndex: true,
    });
  }

  // Priority: Use direct puppy.breed field (new approach)
  // Fallback: Use parent breed if puppy.breed is not set (backward compatibility)
  const breed = puppy.breed ?? puppy.parents?.sire?.breed ?? puppy.parents?.dam?.breed;
  const breedLabel = formatBreed(breed);
  const title = `${puppy.name ?? 'Bulldog'} | Exotic Bulldog Legacy`;
  const description =
    puppy.description ??
    `Learn more about ${puppy.name ?? 'this bulldog'}, one of our carefully raised ${
      breedLabel ?? 'bulldog'
    } puppies in Alabama.`;
  const heroImage = puppy.photo_urls?.[0];

  return buildMetadata({
    title,
    description,
    path: `/puppies/${puppy.slug ?? slug}`,
    image: heroImage,
  });
}

export default async function PuppyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const reservationState = await getPuppyReservationState(slug);
  const puppy = reservationState?.puppy;

  if (!puppy) {
    notFound();
  }

  const productSchema = getProductSchema(puppy);

  const allPuppies = await getPuppiesWithRelations();
  const related = allPuppies
    .filter((candidate) => candidate.id !== puppy.id)
    .filter((candidate) => {
      const sameLitter = puppy.litter_id && candidate.litter_id === puppy.litter_id;
      // Priority: Use direct breed field, fallback to parent breed
      const puppyBreed = puppy.breed ?? puppy.parents?.sire?.breed ?? puppy.parents?.dam?.breed;
      const candidateBreed =
        candidate.breed ?? candidate.parents?.sire?.breed ?? candidate.parents?.dam?.breed;
      const sameBreed = puppyBreed && candidateBreed && puppyBreed === candidateBreed;
      return Boolean(sameLitter || sameBreed);
    })
    .slice(0, 3);

  // Prioritize direct metadata fields over parent records
  const sireName = puppy.sire_name ?? puppy.parents?.sire?.name;
  const damName = puppy.dam_name ?? puppy.parents?.dam?.name;
  const sirePhotos =
    puppy.sire_photo_urls && puppy.sire_photo_urls.length > 0
      ? puppy.sire_photo_urls
      : (puppy.parents?.sire?.photo_urls ?? []);
  const damPhotos =
    puppy.dam_photo_urls && puppy.dam_photo_urls.length > 0
      ? puppy.dam_photo_urls
      : (puppy.parents?.dam?.photo_urls ?? []);
  // Priority: Use direct puppy.breed field (new approach)
  // Fallback: Use parent breed if puppy.breed is not set (backward compatibility)
  const breedLabel =
    formatBreed(puppy.breed ?? puppy.parents?.sire?.breed ?? puppy.parents?.dam?.breed) ?? '';
  const depositAmount = calculateDepositAmount({ priceUsd: puppy.price_usd, fixedAmount: 300 });
  const paypalClientId = process.env.PAYPAL_CLIENT_ID ?? null;

  // Prepare weight display
  const weightDisplay = puppy.weight_oz
    ? `${puppy.weight_oz} oz (Est. Adult: 50 lbs)`
    : 'Contact for details';

  // Get full URL for sharing
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://exoticbulldoglegacy.com';
  const shareUrl = `${siteUrl}/puppies/${slug}`;

  // Direct puppy field access (no parent table fallback)
  const sireStats = [
    {
      label: 'Weight',
      value: puppy.sire_weight_notes || 'Contact for details',
      icon: Weight,
    },
    {
      label: 'Color',
      value: puppy.sire_color_notes || 'Contact for details',
      icon: Star,
    },
    {
      label: 'Health',
      value: puppy.sire_health_notes || 'Health tested',
      icon: Activity,
    },
  ];

  const damStats = [
    {
      label: 'Weight',
      value: puppy.dam_weight_notes || 'Contact for details',
      icon: Weight,
    },
    {
      label: 'Color',
      value: puppy.dam_color_notes || 'Contact for details',
      icon: Star,
    },
    {
      label: 'Health',
      value: puppy.dam_health_notes || 'Health tested',
      icon: Activity,
    },
  ];

  const sireQuote = puppy.sire_temperament_notes || 'Temperament notes coming soon.';
  const damQuote = puppy.dam_temperament_notes || 'Temperament notes coming soon.';

  return (
    <div className="min-h-screen bg-[#0B1120] pb-20 pt-24 font-sans text-white">
      <JsonLd id={`product-${puppy.id}`} data={productSchema} />

      {/* Breadcrumb Navigation */}
      <div className="mx-auto mb-8 flex max-w-7xl items-center gap-2 px-6 pt-8 text-sm text-slate-400 md:px-12">
        <Link
          href="/puppies"
          className="flex items-center gap-1 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Puppies
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-slate-500">{breedLabel || 'Bulldog'}</span>
        <span className="text-slate-700">/</span>
        <span className="font-medium text-white">{puppy.name}</span>
      </div>

      {/* Main Content Grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 md:px-12 lg:grid-cols-2 lg:gap-20">
        {/* Left Column: Gallery */}
        <PuppyGallery
          photos={puppy.photo_urls ?? []}
          videos={puppy.video_urls}
          name={puppy.name}
          status={puppy.status || 'unknown'}
          shareUrl={shareUrl}
        />

        {/* Right Column: Details */}
        <div className="flex flex-col justify-center">
          {/* Breed Badge + Location */}
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-400">
              {breedLabel || 'Bulldog'}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <MapPin size={12} /> Alabama
            </span>
          </div>

          {/* Name */}
          <h1 className="mb-2 text-5xl font-bold text-white md:text-6xl">{puppy.name}</h1>

          {/* Price */}
          <div className="mb-8 flex items-baseline gap-4">
            <span className="text-3xl font-medium text-slate-200">
              {puppy.price_usd ? `$${puppy.price_usd.toLocaleString()}` : 'Contact'}
            </span>
            {(puppy.status === 'sold' || puppy.status === 'reserved') && puppy.price_usd ? (
              <span className="text-sm text-slate-500 line-through">
                ${puppy.price_usd.toLocaleString()}
              </span>
            ) : null}
          </div>
          {/* Stats Grid */}
          <StatsGrid
            birthDate={puppy.birth_date}
            gender={puppy.sex || 'unknown'}
            color={puppy.color || 'TBD'}
            weight={weightDisplay}
          />

          {/* Description */}
          <div className="mb-8">
            <h3 className="mb-2 text-lg font-semibold text-white">Temperament & Notes</h3>
            <p className="text-sm leading-relaxed text-slate-400">
              {puppy.description ??
                'Raised in-home with daily enrichment and early neurological stimulation. Comes with vet health certificate, vaccination record, and lifetime breeder support.'}
            </p>
          </div>

          {/* Health Guarantee Badge */}
          <div className="mb-8">
            <HealthBadge />
          </div>

          {/* Actions */}
          <ReserveButton
            puppySlug={puppy.slug || ''}
            puppyName={puppy.name}
            status={puppy.status || 'unknown'}
            canReserve={reservationState?.canReserve ?? false}
            reservationBlocked={reservationState?.reservationBlocked ?? false}
            depositAmount={depositAmount}
            paypalClientId={paypalClientId}
          />
        </div>
      </div>

      {/* Lineage Section */}
      <div className="mx-auto mt-24 max-w-7xl px-6 md:px-12">
        <div className="mb-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-800"></div>
          <h2 className="text-center text-2xl font-bold uppercase tracking-widest text-white">
            Premium Lineage
          </h2>
          <div className="h-px flex-1 bg-slate-800"></div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Sire Card */}
          {sireName && (
            <ParentCard
              role="sire"
              name={sireName}
              photoUrl={sirePhotos?.[0] ?? null}
              stats={sireStats}
              quote={sireQuote}
            />
          )}

          {/* Dam Card */}
          {damName && (
            <ParentCard
              role="dam"
              name={damName}
              photoUrl={damPhotos?.[0] ?? null}
              stats={damStats}
              quote={damQuote}
            />
          )}
        </div>
      </div>

      {/* Related Puppies */}
      {related.length > 0 && (
        <section className="mx-auto mt-24 max-w-7xl space-y-8 px-6 md:px-12">
          <h2 className="text-3xl font-bold text-white">You may also love</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {related.map((candidate) => (
              <PuppyCard key={candidate.id} puppy={candidate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
