import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { PuppyGallery } from '@/components/puppy-gallery';
import { ParentPhotoCarousel } from '@/components/parent-photo-carousel';
import { PuppyCard } from '@/components/puppy-card';
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
  const sexLabel = puppy.sex ? puppy.sex.charAt(0).toUpperCase() + puppy.sex.slice(1) : '—';
  const statusLabel = puppy.status
    ? puppy.status.charAt(0).toUpperCase() + puppy.status.slice(1)
    : 'Unknown';
  const depositAmount = calculateDepositAmount({ priceUsd: puppy.price_usd, fixedAmount: 300 });
  const paypalClientId = process.env.PAYPAL_CLIENT_ID ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-6 py-12">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Puppies', href: '/puppies' },
          { label: puppy.name ?? 'Puppy', href: `/puppies/${slug}` },
        ]}
      />
      <JsonLd id={`product-${puppy.id}`} data={productSchema} />
      <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr]">
        <PuppyGallery photos={puppy.photo_urls ?? []} videos={puppy.video_urls} name={puppy.name} />
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">
              {breedLabel || 'Bulldog'}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-text">{puppy.name}</h1>
            <p className="text-sm text-muted">
              Born {puppy.birth_date ? new Date(puppy.birth_date).toLocaleDateString() : '—'} ·{' '}
              {sexLabel}
            </p>
          </div>
          <p className="text-base leading-relaxed text-muted">
            {puppy.description ??
              'Raised in-home with daily enrichment and early neurological stimulation. Comes with vet health certificate, vaccination record, and lifetime breeder support.'}
          </p>
          <div className="rounded-3xl border border-border bg-card p-6">
            <p className="text-sm font-semibold text-muted">Details</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted">Status</dt>
                <dd className="font-semibold capitalize text-text">{statusLabel}</dd>
              </div>
              <div>
                <dt className="text-muted">Price</dt>
                <dd className="font-semibold text-text">
                  {puppy.price_usd ? `$${puppy.price_usd.toLocaleString()}` : 'Contact for pricing'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Weight</dt>
                <dd className="font-semibold text-text">
                  {puppy.weight_oz ? `${puppy.weight_oz} oz` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Coat</dt>
                <dd className="font-semibold text-text">{puppy.color ?? '—'}</dd>
              </div>
            </dl>
          </div>
          <ReserveButton
            puppySlug={puppy.slug || ''}
            status={puppy.status || 'unknown'}
            canReserve={reservationState?.canReserve ?? false}
            reservationBlocked={reservationState?.reservationBlocked ?? false}
            depositAmount={depositAmount}
            paypalClientId={paypalClientId}
          />
          <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
            <p className="text-sm font-semibold text-muted">Lineage</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <span className="font-semibold text-text">Sire:</span> {sireName ?? 'TBD'}
              </li>
              <li>
                <span className="font-semibold text-text">Dam:</span> {damName ?? 'TBD'}
              </li>
              <li>
                <span className="font-semibold text-text">Litter:</span>{' '}
                {puppy.litter?.name ?? 'Private'}
              </li>
            </ul>
            <div className="grid gap-4 md:grid-cols-2">
              <ParentPhotoCarousel title="Sire" parentName={sireName} photos={sirePhotos} />
              <ParentPhotoCarousel title="Dam" parentName={damName} photos={damPhotos} />
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-text">You may also love</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((candidate) => (
              <PuppyCard key={candidate.id} puppy={candidate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
