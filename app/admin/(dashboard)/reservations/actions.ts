'use server';

import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/admin/session';
import { ReservationQueries } from '@/lib/reservations/queries';
import type { ReservationStatus, PaymentProvider } from '@/lib/reservations/types';

/**
 * Admin Server Actions for Reservation Management
 *
 * Provides secure server actions for admin operations on reservations:
 * - View all reservations with filters
 * - Manually update reservation status (for webhook failures)
 * - Identify payment status mismatches
 */

/**
 * Require valid admin session or throw error
 */
async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized: Admin session required');
  }
  return session;
}

/**
 * Revalidate reservation-related paths
 */
function revalidateReservationPaths(puppySlug?: string) {
  revalidatePath('/admin/reservations');
  if (puppySlug) {
    revalidatePath(`/puppies/${puppySlug}`);
  }
  revalidatePath('/puppies');
}

/**
 * Get all reservations with optional filters
 *
 * @param filters - Optional filters for status, provider, date range
 * @returns List of reservations with puppy details
 */
export async function getReservationsAction(filters?: {
  status?: ReservationStatus;
  paymentProvider?: PaymentProvider;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  limit?: number;
  offset?: number;
}) {
  try {
    await requireAdminSession();

    const parsedFilters = filters
      ? {
          status: filters.status,
          paymentProvider: filters.paymentProvider,
          startDate: filters.startDate ? new Date(filters.startDate) : undefined,
          endDate: filters.endDate ? new Date(filters.endDate) : undefined,
        }
      : undefined;

    const reservations = await ReservationQueries.getAllWithFilters(
      parsedFilters,
      filters?.limit || 100,
      filters?.offset || 0,
    );

    return {
      success: true,
      reservations,
    };
  } catch (error) {
    console.error('[Admin] Error fetching reservations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch reservations',
      reservations: [],
    };
  }
}

/**
 * Get payment status mismatches
 *
 * Finds reservations stuck in 'pending' with payment IDs.
 * These likely indicate webhook processing failures.
 *
 * @returns List of problematic reservations
 */
export async function getPaymentMismatchesAction() {
  try {
    await requireAdminSession();

    const mismatches = await ReservationQueries.getPaymentStatusMismatches();

    return {
      success: true,
      mismatches,
      count: mismatches.length,
    };
  } catch (error) {
    console.error('[Admin] Error fetching payment mismatches:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch payment mismatches',
      mismatches: [],
      count: 0,
    };
  }
}

/**
 * Manually update reservation status with audit logging
 *
 * Used for customer service or when webhooks fail.
 * Creates audit trail in reservation notes.
 *
 * @param id - Reservation ID
 * @param status - New status to set
 * @param reason - Reason for manual update (required)
 * @param puppySlug - Optional puppy slug for cache revalidation
 * @returns Success indicator and updated reservation
 */
export async function updateReservationStatusAction(input: {
  id: string;
  status: ReservationStatus;
  reason: string;
  puppySlug?: string;
}) {
  try {
    await requireAdminSession();

    // Validate inputs
    if (!input.id || !input.status || !input.reason) {
      return {
        success: false,
        error: 'Missing required fields: id, status, and reason are required',
      };
    }

    if (input.reason.trim().length < 5) {
      return {
        success: false,
        error: 'Reason must be at least 5 characters',
      };
    }

    // Validate status
    const validStatuses: ReservationStatus[] = [
      'pending',
      'paid',
      'cancelled',
      'expired',
      'refunded',
    ];
    if (!validStatuses.includes(input.status)) {
      return {
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      };
    }

    // Update status with audit logging
    const updated = await ReservationQueries.adminUpdateStatus(
      input.id,
      input.status,
      input.reason.trim(),
    );

    if (!updated) {
      return {
        success: false,
        error: 'Reservation not found',
      };
    }

    // Revalidate relevant paths
    revalidateReservationPaths(input.puppySlug);

    console.info(`[Admin] Successfully updated reservation ${input.id} to ${input.status}`);

    return {
      success: true,
      reservation: updated,
      message: `Reservation status updated to ${input.status}`,
    };
  } catch (error) {
    console.error('[Admin] Error updating reservation status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update reservation status',
    };
  }
}

/**
 * Get reservation by ID with full details
 *
 * @param id - Reservation ID
 * @returns Reservation details
 */
export async function getReservationByIdAction(id: string) {
  try {
    await requireAdminSession();

    if (!id) {
      return {
        success: false,
        error: 'Reservation ID is required',
      };
    }

    const reservation = await ReservationQueries.getById(id);

    if (!reservation) {
      return {
        success: false,
        error: 'Reservation not found',
      };
    }

    return {
      success: true,
      reservation,
    };
  } catch (error) {
    console.error('[Admin] Error fetching reservation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch reservation',
    };
  }
}

/**
 * Cancel reservation with reason
 *
 * @param id - Reservation ID
 * @param reason - Cancellation reason
 * @param puppySlug - Optional puppy slug for cache revalidation
 * @returns Success indicator
 */
export async function cancelReservationAction(input: {
  id: string;
  reason: string;
  puppySlug?: string;
}) {
  try {
    await requireAdminSession();

    if (!input.id || !input.reason) {
      return {
        success: false,
        error: 'Reservation ID and reason are required',
      };
    }

    const cancelled = await ReservationQueries.cancel(input.id, input.reason);

    if (!cancelled) {
      return {
        success: false,
        error: 'Failed to cancel reservation',
      };
    }

    revalidateReservationPaths(input.puppySlug);

    return {
      success: true,
      message: 'Reservation cancelled successfully',
    };
  } catch (error) {
    console.error('[Admin] Error cancelling reservation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel reservation',
    };
  }
}

/**
 * Delete reservation (permanent, admin only)
 *
 * @param id - Reservation ID
 * @param puppySlug - Optional puppy slug for cache revalidation
 * @returns Success indicator
 */
export async function deleteReservationAction(input: { id: string; puppySlug?: string }) {
  try {
    await requireAdminSession();

    if (!input.id) {
      return {
        success: false,
        error: 'Reservation ID is required',
      };
    }

    const deleted = await ReservationQueries.delete(input.id);

    if (!deleted) {
      return {
        success: false,
        error: 'Failed to delete reservation',
      };
    }

    revalidateReservationPaths(input.puppySlug);

    console.warn(`[Admin] Reservation ${input.id} permanently deleted`);

    return {
      success: true,
      message: 'Reservation deleted successfully',
    };
  } catch (error) {
    console.error('[Admin] Error deleting reservation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete reservation',
    };
  }
}
