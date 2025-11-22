'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { AdminPuppyRecordWithState } from '@/lib/admin/puppies/queries';
import {
  deletePuppyAction,
  updatePuppyPriceAction,
  updatePuppyStatusAction,
  archivePuppyAction,
  restorePuppyAction,
} from './actions';
import { EditPuppyPanel } from './edit-puppy-panel';

type StatusOption = {
  value: string;
  label: string;
};

interface PuppyRowProps {
  puppy: AdminPuppyRecordWithState;
  statusOptions: StatusOption[];
  archived: boolean;
}

export function PuppyRow({ puppy, statusOptions, archived }: PuppyRowProps) {
  const router = useRouter();
  const [statusPending, startStatusTransition] = useTransition();
  const [pricePending, startPriceTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [archivePending, startArchiveTransition] = useTransition();
  const [restorePending, startRestoreTransition] = useTransition();

  const [priceValue, setPriceValue] = useState(() =>
    typeof puppy.price_usd === 'number' ? String(puppy.price_usd) : '',
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [editPanelOpen, setEditPanelOpen] = useState(false);

  const originalPrice = useMemo(
    () => (typeof puppy.price_usd === 'number' ? String(puppy.price_usd) : ''),
    [puppy.price_usd],
  );
  const isPriceDirty = priceValue !== originalPrice;

  const normalizedName = (puppy.name ?? '').trim();
  const confirmMatches =
    normalizedName.length > 0 && confirmName.trim().toLowerCase() === normalizedName.toLowerCase();

  const sharedDisabled =
    statusPending || pricePending || deletePending || archivePending || restorePending;
  const archiveBlocked = Boolean(puppy.has_active_reservation);

  function handleStatusChange(value: string) {
    startStatusTransition(async () => {
      try {
        const result = await updatePuppyStatusAction({
          id: puppy.id,
          status: value,
          slug: puppy.slug,
        });
        if (result.archived) {
          toast.success(`Status updated to ${value} (puppy archived automatically)`);
        } else {
          toast.success(`Status updated to ${value}`);
        }
        router.refresh();
      } catch (error) {
        toast.error('Failed to update status');
        console.error(error);
      }
    });
  }

  function handleSavePrice() {
    const numericValue = Number(priceValue);
    if (!priceValue || Number.isNaN(numericValue)) {
      toast.error('Enter a valid price (USD).');
      return;
    }
    if (numericValue < 0.01) {
      toast.error('Price must be at least $0.01.');
      return;
    }

    startPriceTransition(async () => {
      try {
        await updatePuppyPriceAction({
          id: puppy.id,
          priceUsd: String(numericValue),
          slug: puppy.slug,
        });
        toast.success('Price updated');
        router.refresh();
      } catch (error) {
        toast.error('Failed to update price');
        console.error(error);
      }
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      try {
        const result = await deletePuppyAction({ id: puppy.id, confirmName });
        if (!result.success) {
          toast.error(result.error ?? 'Unable to delete puppy.');
          return;
        }
        toast.success('Puppy deleted');
        router.refresh();
      } catch (error) {
        toast.error('Failed to delete puppy');
        console.error(error);
      }
    });
  }

  function handleArchive() {
    startArchiveTransition(async () => {
      try {
        const result = await archivePuppyAction({ id: puppy.id, slug: puppy.slug });
        if (!result.success) {
          toast.error(result.error ?? 'Failed to archive puppy');
          return;
        }
        toast.success('Puppy archived successfully');
        setConfirmArchive(false);
        router.refresh();
      } catch (error) {
        toast.error('Failed to archive puppy');
        console.error(error);
      }
    });
  }

  function handleRestore() {
    startRestoreTransition(async () => {
      try {
        const result = await restorePuppyAction({ id: puppy.id, slug: puppy.slug });
        if (!result.success) {
          toast.error('Failed to restore puppy');
          return;
        }
        toast.success('Puppy restored successfully');
        router.refresh();
      } catch (error) {
        toast.error('Failed to restore puppy');
        console.error(error);
      }
    });
  }

  return (
    <li className="group grid grid-cols-1 gap-6 px-6 py-5 text-sm text-white bg-[#1E293B]/40 border border-slate-800/50 rounded-xl shadow-lg shadow-black/10 transition-all duration-300 hover:border-slate-700 md:grid-cols-[auto,2fr,1.4fr,1.4fr,1.2fr,auto] md:items-start">
      {/* Puppy Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700">
        {puppy.photo_urls && puppy.photo_urls.length > 0 ? (
          <img
            src={puppy.photo_urls[0]}
            alt={puppy.name ?? 'Puppy'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
            No image
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-white text-lg">{puppy.name ?? 'Untitled puppy'}</p>
          {puppy.has_active_reservation && (
            <span
              className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"
              title="Active Reservation"
            />
          )}
        </div>
        <p className="break-all text-xs text-slate-500">{puppy.slug}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor={`status-${puppy.id}`} className="text-xs text-slate-400 md:hidden">
          Status
        </label>
        <select
          id={`status-${puppy.id}`}
          name="status"
          defaultValue={puppy.status}
          disabled={statusPending || sharedDisabled}
          onChange={(event) => handleStatusChange(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 md:hidden">Inline updates save instantly.</p>
        {archiveBlocked && (
          <p className="text-xs font-semibold text-orange-300">Reservation active</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={`price-${puppy.id}`} className="text-xs text-slate-400 md:hidden">
          Price (USD)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">$</span>
          <input
            id={`price-${puppy.id}`}
            name="price"
            type="number"
            inputMode="decimal"
            step="50"
            placeholder="0.00"
            value={priceValue}
            onChange={(event) => setPriceValue(event.target.value)}
            disabled={pricePending || sharedDisabled}
            className="w-full rounded-xl border border-slate-700 bg-[#0B1120] px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={handleSavePrice}
            disabled={!isPriceDirty || pricePending || sharedDisabled}
            className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-orange-500/20 transition hover:from-orange-400 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pricePending ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setPriceValue(originalPrice)}
            disabled={!isPriceDirty || pricePending || sharedDisabled}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted md:hidden">Birth date</p>
        <p className="font-medium">
          {(() => {
            if (!puppy.birth_date) return '—';
            const date = new Date(puppy.birth_date);
            if (Number.isNaN(date.getTime())) return '—';
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
          })()}
        </p>
      </div>

      <div className="flex flex-col items-start gap-2 md:items-end">
        {!archived && (
          <>
            <button
              type="button"
              onClick={() => setEditPanelOpen(true)}
              disabled={sharedDisabled}
              className="rounded-lg border border-accent bg-accent px-3 py-1.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Edit
            </button>
            <Link
              href={`/puppies/${puppy.slug}`}
              prefetch={false}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text transition hover:bg-hover"
              target="_blank"
            >
              Open public page
            </Link>
          </>
        )}

        {archived ? (
          // Archived puppy actions
          <>
            <button
              type="button"
              onClick={handleRestore}
              disabled={restorePending || sharedDisabled}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text transition hover:bg-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {restorePending ? 'Restoring...' : 'Restore'}
            </button>
            {!confirmOpen ? (
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red-200 hover:text-red-500"
                onClick={() => setConfirmOpen(true)}
                disabled={sharedDisabled}
              >
                Delete Permanently
              </button>
            ) : (
              <div className="w-full space-y-2 rounded-lg border border-border bg-bg p-3 text-xs">
                <p className="font-medium text-red-500">
                  Type &ldquo;{normalizedName || 'name'}&rdquo; to confirm permanent deletion.
                </p>
                <input
                  value={confirmName}
                  onChange={(event) => setConfirmName(event.target.value)}
                  disabled={deletePending}
                  className="w-full rounded-lg border border-border bg-card px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!confirmMatches || deletePending}
                    className="rounded-lg bg-red-500 px-3 py-1 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletePending ? 'Deleting...' : 'Confirm delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmName('');
                      setConfirmOpen(false);
                    }}
                    className="rounded-lg border border-border px-3 py-1 text-muted transition hover:bg-hover"
                    disabled={deletePending}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {archiveBlocked ? (
              <div className="w-full space-y-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs">
                <p className="font-semibold text-orange-900">Reservation active</p>
                <p className="text-orange-700">
                  Cancel or complete the pending reservation before archiving this puppy.
                </p>
              </div>
            ) : !confirmArchive ? (
              <button
                type="button"
                onClick={() => setConfirmArchive(true)}
                disabled={sharedDisabled}
                className="rounded-lg border border-orange-500 px-3 py-1.5 text-xs font-medium text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Archive
              </button>
            ) : (
              <div className="w-full space-y-2 rounded-lg border-2 border-orange-500 bg-orange-50 p-3 text-xs">
                <p className="font-medium text-orange-900">Archive this puppy?</p>
                <p className="text-xs text-orange-700">
                  It will be hidden from public catalog but preserved for historical records.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleArchive}
                    disabled={archivePending}
                    className="rounded-lg bg-orange-500 px-3 py-1 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {archivePending ? 'Archiving...' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmArchive(false)}
                    className="rounded-lg border border-orange-300 px-3 py-1 text-orange-700 transition hover:bg-orange-100"
                    disabled={archivePending}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editPanelOpen && (
        <EditPuppyPanel
          puppyId={puppy.id}
          statusOptions={statusOptions}
          onClose={() => setEditPanelOpen(false)}
        />
      )}
    </li>
  );
}
