import Link from "next/link";
import { fetchAdminPuppies } from "@/lib/admin/puppies/queries";

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
  { value: "upcoming", label: "Upcoming" },
] as const;

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminPuppiesPage() {
  const puppies = await fetchAdminPuppies();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-text">Manage puppies</h2>
          <p className="text-sm text-muted">Review statuses, pricing, and quick links to public listings.</p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-[color:var(--btn-bg,#0D1A44)] px-4 py-2 text-sm font-semibold text-[color:var(--btn-text,#FFFFFF)] transition hover:opacity-90"
        >
          Add puppy
        </button>
      </div>

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
          <ul className="divide-y divide-border">
            {puppies.map((puppy) => (
              <li key={puppy.id} className="grid grid-cols-1 gap-6 px-6 py-5 text-sm text-text md:grid-cols-[2fr,1.4fr,1.4fr,1.2fr,auto] md:items-center">
                <div className="space-y-1">
                  <p className="font-medium">{puppy.name ?? "Untitled puppy"}</p>
                  <p className="text-xs text-muted break-all">{puppy.slug}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`status-${puppy.id}`} className="text-xs text-muted md:hidden">
                    Status
                  </label>
                  <select
                    id={`status-${puppy.id}`}
                    name="status"
                    defaultValue={puppy.status}
                    disabled
                    className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted md:hidden">Inline updates arrive in the next phase.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`price-${puppy.id}`} className="text-xs text-muted md:hidden">
                    Price (USD)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">$</span>
                    <input
                      id={`price-${puppy.id}`}
                      name="price"
                      type="number"
                      inputMode="decimal"
                      step="100"
                      placeholder="0.00"
                      defaultValue={puppy.price_usd ?? undefined}
                      disabled
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted md:hidden">Birth date</p>
                  <p className="font-medium">{formatDate(puppy.birth_date)}</p>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <Link href={`/puppies/${puppy.slug}`} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text transition hover:bg-hover">
                    Open public page
                  </Link>
                  <button
                    type="button"
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red-200 hover:text-red-500"
                    disabled
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
