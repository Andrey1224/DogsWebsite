import { adminPuppyStatusSchema } from "@/lib/admin/puppies/schema";
import { fetchAdminPuppies, fetchAdminLittersWithParents } from "@/lib/admin/puppies/queries";
import { CreatePuppyPanel } from "./create-puppy-panel";
import { PuppyRow } from "./puppy-row";

const statusOptions = adminPuppyStatusSchema.options.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export default async function AdminPuppiesPage() {
  const puppies = await fetchAdminPuppies();
  const litters = await fetchAdminLittersWithParents();

  const litterOptions = litters.map((litter) => ({
    value: litter.id,
    label: litter.name
      ? `${litter.name}${litter.sire?.name && litter.dam?.name ? ` (${litter.sire.name} × ${litter.dam.name})` : ""}`
      : litter.id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text">Manage puppies</h2>
        <p className="text-sm text-muted">Review statuses, pricing, and quick links to public listings.</p>
      </div>

      <CreatePuppyPanel statusOptions={statusOptions} litterOptions={litterOptions} />

      {puppies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-bg/40 p-8 text-center">
          <p className="text-lg font-medium text-text">No puppies yet</p>
          <p className="mt-2 text-sm text-muted">Use “Add puppy” to create your first listing.</p>
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
              <PuppyRow key={puppy.id} puppy={puppy} statusOptions={statusOptions} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
