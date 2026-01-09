import Link from 'next/link';
import { getReservationsAction, getPaymentMismatchesAction } from './actions';

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  paid: 'bg-green-500/10 text-green-500 border-green-500/20',
  refunded: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  expired: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default async function AdminReservationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = params.status;

  const [reservationsResult, mismatchesResult] = await Promise.all([
    getReservationsAction(
      statusFilter
        ? {
            status: statusFilter as 'pending' | 'paid' | 'refunded' | 'cancelled' | 'expired',
            limit: 50,
          }
        : { limit: 50 },
    ),
    getPaymentMismatchesAction(),
  ]);

  const reservations = reservationsResult.success ? reservationsResult.reservations : [];
  const mismatches = mismatchesResult.success ? mismatchesResult.mismatches : [];

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Admin Console
        </p>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Manage Reservations</h2>
            <p className="text-sm text-slate-400">
              View and manage customer reservations and payment status
            </p>
          </div>
        </div>
      </div>

      {/* Payment Mismatches Alert */}
      {mismatches.length > 0 && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-500">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-500">Payment Status Mismatches</h3>
              <p className="mt-1 text-sm text-yellow-500/80">
                Found {mismatches.length} reservation(s) stuck in pending status with payment IDs.
                These likely indicate webhook processing failures.
              </p>
              <Link
                href="/admin/reservations?status=pending"
                className="mt-2 inline-block text-sm underline hover:text-yellow-400"
              >
                View pending reservations →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/reservations"
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            !statusFilter
              ? 'border-orange-500 bg-orange-500/10 text-orange-500'
              : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
          }`}
        >
          All
        </Link>
        {['pending', 'paid', 'refunded', 'cancelled', 'expired'].map((status) => (
          <Link
            key={status}
            href={`/admin/reservations?status=${status}`}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Link>
        ))}
      </div>

      {/* Reservations Table */}
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Puppy
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Provider
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No reservations found
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-400">
                        {reservation.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {reservation.customer_name || 'N/A'}
                        </span>
                        <span className="text-xs text-slate-400">{reservation.customer_email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {reservation.puppy ? (
                        <Link
                          href={`/puppies/${reservation.puppy.slug}`}
                          className="text-sm text-orange-500 hover:underline"
                          target="_blank"
                        >
                          {reservation.puppy.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-400">Unknown</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">
                        ${reservation.deposit_amount?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                          statusColors[reservation.status] || statusColors.pending
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm capitalize">{reservation.payment_provider}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">
                        {new Date(reservation.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Total', count: reservations.length, color: 'text-slate-400' },
          {
            label: 'Paid',
            count: reservations.filter((r) => r.status === 'paid').length,
            color: 'text-green-500',
          },
          {
            label: 'Pending',
            count: reservations.filter((r) => r.status === 'pending').length,
            color: 'text-yellow-500',
          },
          {
            label: 'Refunded',
            count: reservations.filter((r) => r.status === 'refunded').length,
            color: 'text-purple-500',
          },
          {
            label: 'Cancelled',
            count: reservations.filter((r) => r.status === 'cancelled').length,
            color: 'text-gray-500',
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-xs text-slate-400">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-300">Note</h3>
        <p className="text-xs text-slate-400">
          To manually update a reservation status (e.g., for webhook failures), contact the
          development team. Manual status updates will be logged in the reservation notes for audit
          purposes.
        </p>
      </div>
    </div>
  );
}
