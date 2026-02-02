/**
 * Reservation Database Queries
 *
 * Database operations for reservations, puppies, and webhook events
 * with proper error handling and transaction support.
 */

import { createSupabaseClient } from '@/lib/supabase/client';
import type {
  Reservation,
  ReservationWithPuppy,
  ReservationSummary,
  PaymentProvider,
  ReservationStatus,
  WebhookEvent,
} from './types';

/**
 * Supabase client instance
 */
const supabase = createSupabaseClient();

/**
 * Reservation queries
 */
export class ReservationQueries {
  /**
   * Create a new reservation
   */
  static async create(
    reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<Reservation> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert(reservation)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create reservation: ${error.message}`);
      }

      return data as Reservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  }

  /**
   * Get reservation by ID
   */
  static async getById(id: string): Promise<Reservation | null> {
    try {
      const { data, error } = await supabase.from('reservations').select('*').eq('id', id).single();

      if (error || !data) {
        return null;
      }

      return data as Reservation;
    } catch (error) {
      console.error('Error getting reservation:', error);
      return null;
    }
  }

  /**
   * Get reservation by payment details
   */
  static async getByPayment(
    provider: PaymentProvider,
    externalPaymentId: string,
  ): Promise<Reservation | null> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('payment_provider', provider)
        .eq('external_payment_id', externalPaymentId)
        .single();

      if (error || !data) {
        return null;
      }

      return data as Reservation;
    } catch (error) {
      console.error('Error getting reservation by payment:', error);
      return null;
    }
  }

  /**
   * Update reservation
   */
  static async update(id: string, updates: Partial<Reservation>): Promise<Reservation | null> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        return null;
      }

      return data as Reservation;
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  }

  /**
   * Update reservation status
   */
  static async updateStatus(id: string, status: ReservationStatus): Promise<Reservation | null> {
    return this.update(id, { status });
  }

  /**
   * Get reservations for a puppy
   */
  static async getByPuppyId(puppyId: string): Promise<Reservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('puppy_id', puppyId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data as Reservation[];
    } catch (error) {
      console.error('Error getting reservations by puppy:', error);
      return [];
    }
  }

  /**
   * Get active reservations for a puppy
   */
  static async getActiveByPuppyId(puppyId: string): Promise<Reservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('puppy_id', puppyId)
        .in('status', ['pending', 'paid'])
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data as Reservation[];
    } catch (error) {
      console.error('Error getting active reservations by puppy:', error);
      return [];
    }
  }

  /**
   * Determine whether a puppy currently has an active reservation
   * (paid reservations or pending ones that have not expired).
   */
  static async hasActiveReservation(puppyId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('status, expires_at')
        .eq('puppy_id', puppyId)
        .in('status', ['pending', 'paid'])
        .order('created_at', { ascending: false });

      if (error || !data) {
        return false;
      }

      const now = Date.now();
      return data.some((reservation) => {
        if (reservation.status === 'paid') {
          return true;
        }

        if (!reservation.expires_at) {
          return true;
        }

        const expiresAtTime = new Date(reservation.expires_at as string).getTime();
        return Number.isFinite(expiresAtTime) && expiresAtTime > now;
      });
    } catch (error) {
      console.error('Error checking active reservation:', error);
      return false;
    }
  }

  /**
   * Get reservations with puppy details
   */
  static async getWithPuppy(
    limit: number = 50,
    offset: number = 0,
  ): Promise<ReservationWithPuppy[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(
          `
          *,
          puppy:puppies(
            id,
            name,
            breed_id,
            status,
            price
          )
        `,
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error || !data) {
        return [];
      }

      return data as ReservationWithPuppy[];
    } catch (error) {
      console.error('Error getting reservations with puppy:', error);
      return [];
    }
  }

  /**
   * Get reservations by customer email
   */
  static async getByCustomerEmail(email: string): Promise<Reservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .ilike('customer_email', email)
        .order('created_at', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data as Reservation[];
    } catch (error) {
      console.error('Error getting reservations by customer email:', error);
      return [];
    }
  }

  /**
   * Get reservation summary for a puppy
   */
  static async getSummary(puppyId: string): Promise<ReservationSummary> {
    try {
      const { data, error } = await supabase.rpc('get_reservation_summary', {
        puppy_id_param: puppyId,
      });

      if (error || !data || data.length === 0) {
        return {
          total_reservations: 0,
          pending_reservations: 0,
          paid_reservations: 0,
          total_amount: 0,
        };
      }

      const summary = data[0];
      return {
        total_reservations: summary.total_reservations || 0,
        pending_reservations: summary.pending_reservations || 0,
        paid_reservations: summary.paid_reservations || 0,
        total_amount: parseFloat(summary.total_amount) || 0,
      };
    } catch (error) {
      console.error('Error getting reservation summary:', error);
      return {
        total_reservations: 0,
        pending_reservations: 0,
        paid_reservations: 0,
        total_amount: 0,
      };
    }
  }

  /**
   * Cancel reservation
   */
  static async cancel(id: string, reason?: string): Promise<Reservation | null> {
    const updates: Partial<Reservation> = {
      status: 'cancelled',
    };

    if (reason) {
      updates.notes = reason;
    }

    return this.update(id, updates);
  }

  /**
   * Expire old pending reservations
   */
  static async expireOldPending(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('expire_pending_reservations');

      if (error) {
        console.error('Error expiring pending reservations:', error);
        return 0;
      }

      return typeof data === 'number' ? data : 0;
    } catch (err) {
      console.error('Error expiring pending reservations:', err);
      return 0;
    }
  }

  /**
   * Delete reservation (admin only)
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('reservations').delete().eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      return false;
    }
  }

  /**
   * Get payment status mismatches (admin only)
   *
   * Finds reservations that are stuck in 'pending' status but have
   * external_payment_id and are older than 15 minutes.
   * These likely indicate webhook processing issues.
   */
  static async getPaymentStatusMismatches(): Promise<Reservation[]> {
    try {
      const fifteenMinutesAgo = new Date();
      fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('status', 'pending')
        .not('external_payment_id', 'is', null)
        .lt('created_at', fifteenMinutesAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.error('Error getting payment status mismatches:', error);
        return [];
      }

      return data as Reservation[];
    } catch (error) {
      console.error('Error getting payment status mismatches:', error);
      return [];
    }
  }

  /**
   * Admin manual status update with audit logging
   *
   * Updates reservation status with audit trail in notes field.
   * Used for manual interventions when webhooks fail or for
   * customer service scenarios.
   *
   * @param id - Reservation ID
   * @param status - New status to set
   * @param adminReason - Reason for manual update (required for audit)
   * @returns Updated reservation or null if not found
   */
  static async adminUpdateStatus(
    id: string,
    status: ReservationStatus,
    adminReason: string,
  ): Promise<Reservation | null> {
    try {
      const existing = await this.getById(id);
      if (!existing) {
        console.error(`Admin update failed: Reservation ${id} not found`);
        return null;
      }

      const timestamp = new Date().toISOString();
      const auditNote = `[Admin Override ${timestamp}] Status changed: ${existing.status} → ${status}. Reason: ${adminReason}`;
      const updatedNotes = existing.notes ? `${existing.notes}\n\n${auditNote}` : auditNote;

      console.info(`[Admin] Updating reservation ${id} status to ${status}`, {
        previousStatus: existing.status,
        newStatus: status,
        reason: adminReason,
      });

      return this.update(id, {
        status,
        notes: updatedNotes,
      });
    } catch (error) {
      console.error('Error in admin status update:', error);
      throw error;
    }
  }

  /**
   * Get all reservations with filters (admin only)
   *
   * Supports filtering by status, payment provider, and date range.
   * Includes puppy details for display.
   *
   * @param filters - Optional filters for status, provider, date range
   * @param limit - Number of results to return (default: 100)
   * @param offset - Offset for pagination (default: 0)
   */
  static async getAllWithFilters(
    filters?: {
      status?: ReservationStatus;
      paymentProvider?: PaymentProvider;
      startDate?: Date;
      endDate?: Date;
    },
    limit: number = 100,
    offset: number = 0,
  ): Promise<ReservationWithPuppy[]> {
    try {
      let query = supabase
        .from('reservations')
        .select(
          `
          *,
          puppy:puppies(
            id,
            name,
            breed_id,
            status,
            price,
            slug
          )
        `,
        )
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.paymentProvider) {
        query = query.eq('payment_provider', filters.paymentProvider);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error || !data) {
        console.error('Error getting reservations with filters:', error);
        return [];
      }

      return data as ReservationWithPuppy[];
    } catch (error) {
      console.error('Error getting reservations with filters:', error);
      return [];
    }
  }
}

/**
 * Puppy availability queries
 */
export class PuppyQueries {
  /**
   * Check if puppy is available for reservation
   */
  static async isAvailable(puppyId: string): Promise<boolean> {
    try {
      // Check if puppy exists and is available
      const { data: puppy, error: puppyError } = await supabase
        .from('puppies')
        .select('id, status')
        .eq('id', puppyId)
        .single();

      if (puppyError || !puppy) {
        return false;
      }

      if (puppy.status !== 'available') {
        return false;
      }

      // Check for existing active reservations
      const { data: reservations, error: reservationError } = await supabase
        .from('reservations')
        .select('id')
        .eq('puppy_id', puppyId)
        .in('status', ['pending', 'paid'])
        .limit(1);

      if (reservationError) {
        return false;
      }

      return !reservations || reservations.length === 0;
    } catch (error) {
      console.error('Error checking puppy availability:', error);
      return false;
    }
  }

  /**
   * Get puppy details
   */
  static async getById(puppyId: string) {
    try {
      const { data, error } = await supabase
        .from('puppies')
        .select(
          `
          id,
          name,
          breed_id,
          status,
          price,
          gender,
          birth_date,
          description
        `,
        )
        .eq('id', puppyId)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting puppy details:', error);
      return null;
    }
  }

  /**
   * Update puppy status
   */
  static async updateStatus(puppyId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('puppies').update({ status }).eq('id', puppyId);

      return !error;
    } catch (error) {
      console.error('Error updating puppy status:', error);
      return false;
    }
  }
}

/**
 * Webhook event queries
 */
export class WebhookEventQueries {
  /**
   * Create webhook event
   */
  static async create(
    event: Omit<WebhookEvent, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<WebhookEvent> {
    try {
      const { data, error } = await supabase.from('webhook_events').insert(event).select().single();

      if (error) {
        throw new Error(`Failed to create webhook event: ${error.message}`);
      }

      return data as WebhookEvent;
    } catch (error) {
      console.error('Error creating webhook event:', error);
      throw error;
    }
  }

  /**
   * Get webhook event by ID
   */
  static async getById(id: number): Promise<WebhookEvent | null> {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return data as WebhookEvent;
    } catch (error) {
      console.error('Error getting webhook event:', error);
      return null;
    }
  }

  /**
   * Get webhook event by provider and event ID
   */
  static async getByProviderEvent(
    provider: PaymentProvider,
    eventId: string,
  ): Promise<WebhookEvent | null> {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('provider', provider)
        .eq('event_id', eventId)
        .single();

      if (error || !data) {
        return null;
      }

      return data as WebhookEvent;
    } catch (error) {
      console.error('Error getting webhook event by provider event:', error);
      return null;
    }
  }

  /**
   * Get unprocessed webhook events
   */
  static async getUnprocessed(limit: number = 10): Promise<WebhookEvent[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('processed', false)
        .or("processing_started_at.is.null,processing_started_at.lt.now() - interval '5 minutes'")
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error || !data) {
        return [];
      }

      return data as WebhookEvent[];
    } catch (error) {
      console.error('Error getting unprocessed webhook events:', error);
      return [];
    }
  }

  /**
   * Update webhook event
   */
  static async update(id: number, updates: Partial<WebhookEvent>): Promise<WebhookEvent | null> {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        return null;
      }

      return data as WebhookEvent;
    } catch (error) {
      console.error('Error updating webhook event:', error);
      throw error;
    }
  }

  /**
   * Mark webhook event as processed
   */
  static async markAsProcessed(id: number, reservationId?: string): Promise<boolean> {
    try {
      const updates: Partial<WebhookEvent> = {
        processed: true,
        processed_at: new Date().toISOString(),
      };

      if (reservationId) {
        updates.reservation_id = reservationId;
      }

      const { error } = await supabase.from('webhook_events').update(updates).eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error marking webhook as processed:', error);
      return false;
    }
  }

  /**
   * Mark webhook event as failed
   */
  static async markAsFailed(id: number, errorMessage: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          processing_error: errorMessage,
        })
        .eq('id', id);

      return !error;
    } catch (err) {
      console.error('Error marking webhook as failed:', err);
      return false;
    }
  }

  /**
   * Delete old processed events
   */
  static async cleanupOld(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabase
        .from('webhook_events')
        .delete()
        .eq('processed', true)
        .lt('created_at', cutoffDate.toISOString());

      return !error ? 1 : 0;
    } catch (error) {
      console.error('Error cleaning up old webhook events:', error);
      return 0;
    }
  }
}

/**
 * Transaction utilities
 */
export class TransactionQueries {
  /**
   * Create reservation with webhook event atomically
   */
  static async createReservationWithWebhook(
    reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>,
    webhookEvent: Omit<WebhookEvent, 'id' | 'created_at' | 'updated_at' | 'reservation_id'>,
  ): Promise<{ reservation: Reservation; webhookEvent: WebhookEvent }> {
    try {
      // Use a single RPC call for atomic transaction
      const { data, error } = await supabase.rpc('create_reservation_with_webhook', {
        p_reservation: reservation,
        p_webhook_event: webhookEvent,
      });

      if (error || !data) {
        throw new Error(`Failed to create reservation with webhook: ${error?.message}`);
      }

      return data as { reservation: Reservation; webhookEvent: WebhookEvent };
    } catch (error) {
      console.error('Error creating reservation with webhook:', error);
      throw error;
    }
  }
}
