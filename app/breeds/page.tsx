import { Breadcrumbs } from '@/components/breadcrumbs';
import { buildMetadata } from '@/lib/seo/metadata';
import { BreedSelector } from './breed-selector';

export const metadata = buildMetadata({
  title: 'Meet the Breeds — French & English Bulldogs',
  description:
    'Discover the unique personalities of French and English Bulldogs. Learn why these beloved breeds make perfect companions and which one matches your lifestyle.',
  path: '/breeds',
});

export default function BreedsPage() {
  return (
    <main id="main-content" className="bg-bg">
      <div className="mx-auto w-full max-w-7xl px-6 pb-16 pt-10 xl:px-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Meet the Breeds', href: '/breeds' },
          ]}
        />

        {/* Page Header */}
        <section className="mt-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">
            Meet the Breeds
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-text md:text-4xl lg:text-5xl">
            Why We Love Them
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted md:text-lg">
            Discover the unique personalities of French and English Bulldogs. Find out which breed
            matches your lifestyle and spirit.
          </p>
        </section>

        {/* Breed Content with Tabs */}
        <div className="mt-12">
          <BreedSelector />
        </div>
      </div>
    </main>
  );
}
