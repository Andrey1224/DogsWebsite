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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text">Manage puppies</h2>
        <p className="text-sm text-muted">
          Review statuses, pricing, and quick links to public listings.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6" aria-label="Puppy views">
          <Link
            href="/admin/puppies"
            className={`border-b-2 pb-2 text-sm font-medium transition ${
              view === 'active'
                ? 'border-accent text-text'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            Active
          </Link>
          <Link
            href="/admin/puppies?view=archived"
            className={`border-b-2 pb-2 text-sm font-medium transition ${
              view === 'archived'
                ? 'border-accent text-text'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            Archived
          </Link>
        </nav>
      </div>

      {/* Create button only on active tab */}
      {!isArchived && <CreatePuppyPanel statusOptions={statusOptions} />}

      {puppies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-bg/40 p-8 text-center">
          <p className="text-lg font-medium text-text">
            {isArchived ? 'No archived puppies' : 'No puppies yet'}
          </p>
          <p className="mt-2 text-sm text-muted">
            {isArchived
              ? 'Archived puppies will appear here when you archive them from the Active tab.'
              : 'Use "Add puppy" to create your first listing.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-[2fr,1.4fr,1.4fr,1.2fr,auto] gap-4 border-b border-border bg-bg px-6 py-3 text-xs font-semibold uppercase tracking-wide text-muted max-md:hidden">
            <span>Name</span>
            <span>Status</span>
            <span>Price (USD)</span>
            <span>Birth date</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-border" data-testid="admin-puppy-list">
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
