import Link from 'next/link';
import { adminPuppyStatusSchema } from '@/lib/admin/puppies/schema';
import { fetchAdminPuppies } from '@/lib/admin/puppies/queries';
import { CreatePuppyPanel } from './create-puppy-panel';
import { PuppyRow } from './puppy-row';

const statusOptions = adminPuppyStatusSchema.options.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

type PageProps = {
  searchParams: Promise<{ view?: string }>;
};

export default async function AdminPuppiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = params.view === 'archived' ? 'archived' : 'active';
  const isArchived = view === 'archived';

  const puppies = await fetchAdminPuppies({ archived: isArchived, includeReservationState: true });

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Admin Console
        </p>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Manage puppies</h2>
            <p className="text-sm text-slate-400">
              Track inventory, pricing, and quick links to public listings.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 pb-1">
        <nav className="flex gap-6" aria-label="Puppy views">
          <Link
            href="/admin/puppies"
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              view === 'active'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Active listings
          </Link>
          <Link
            href="/admin/puppies?view=archived"
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              view === 'archived'
                ? 'border-orange-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Archived
          </Link>
        </nav>
      </div>

      {/* Create button only on active tab */}
      {!isArchived && <CreatePuppyPanel statusOptions={statusOptions} />}

      {puppies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-[#1E293B]/40 p-10 text-center">
          <p className="text-lg font-semibold text-white">
            {isArchived ? 'No archived puppies' : 'No puppies yet'}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {isArchived
              ? 'Archived puppies will appear here when you archive them from the Active tab.'
              : 'Use "Add puppy" to create your first listing.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="admin-puppy-list">
          <div className="hidden grid-cols-[2fr,1.2fr,1.2fr,1fr,auto] gap-4 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 md:grid">
            <span>Name / slug</span>
            <span>Status</span>
            <span>Price</span>
            <span>Birth date</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="space-y-3">
            {puppies.map((puppy) => (
              <PuppyRow
                key={puppy.id}
                puppy={puppy}
                statusOptions={statusOptions}
                archived={isArchived}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
