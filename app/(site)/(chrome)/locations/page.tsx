import Link from 'next/link';
import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo/metadata';
import { getIndexableLocations } from '@/lib/data/locations';

export const dynamic = 'force-static';

export const metadata: Metadata = buildMetadata({
  title: 'Service Areas — French & English Bulldog Puppies in Alabama',
  description:
    'Exotic Bulldog Legacy serves families across Alabama and beyond. Browse our service area pages for city-specific pickup logistics, delivery options, and local testimonials.',
  path: '/locations',
});

export default function LocationsPage() {
  const locations = getIndexableLocations();

  return (
    <div className="min-h-screen bg-[#0B1120] pb-20 font-sans text-white">
      {/* Header */}
      <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-32 md:px-12">
        <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-orange-400">
            Where We Serve
          </div>
          <h1 className="mb-4 text-4xl font-bold leading-tight md:text-6xl">Service Areas</h1>
          <p className="text-lg text-slate-400">
            Based in Alabama, Exotic Bulldog Legacy offers pickup by appointment and nationwide
            delivery via flight nanny. Browse our city pages for local logistics, testimonials, and
            city-specific FAQs.
          </p>
        </div>
      </div>

      {/* City Cards */}
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {locations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-[#151e32]/50 p-10 text-center text-sm text-slate-400">
            No service areas listed yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/locations/${loc.slug}`}
                className="group rounded-2xl border border-slate-800 bg-[#151e32] p-8 transition-colors hover:border-slate-600 hover:bg-[#1a2540]"
              >
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-400">
                  {loc.state}
                </div>
                <h2 className="mb-3 text-2xl font-bold text-white">{loc.city}</h2>
                <p className="mb-6 text-sm leading-relaxed text-slate-400">
                  {loc.heroText.slice(0, 140)}&hellip;
                </p>
                {loc.driveTimeMinutes && (
                  <div className="mb-4 text-xs text-slate-500">
                    ~{loc.driveTimeMinutes} min from kennel
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm font-semibold text-orange-400 transition-colors group-hover:text-orange-300">
                  View {loc.city} details →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
