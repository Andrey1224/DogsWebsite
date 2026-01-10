/**
 * Server-Side Reservation Queries
 *
 * Database operations for reservations that require elevated permissions
 * (service role). This file is server-only and MUST NOT be imported
 * in client components.
 *
 * CRITICAL:
 * - Uses Supabase service role to bypass RLS
 * - Only for server-side code (API routes, webhooks, server actions)
 * - Do NOT import in client components
 */

import 'server-only';

import { createServiceRoleClient } from '@/lib/supabase/client';
import type { Reservation, PaymentProvider, ReservationStatus } from './types';

/**
 * Server-side reservation queries using service role
 */
export class ReservationServerQueries {
  /**
   * Mark reservation as paid with payment details
   *
   * Updates reservation status to 'paid' and records payment information.
   * Used by webhook handlers after successful payment confirmation.
   *
   * @param params - Reservation ID and payment details
   * @returns Updated reservation or null on error
   */
  static async markPaid(params: {
    reservationId: string;
    provider: PaymentProvider;
    externalPaymentId: string;
  }): Promise<Reservation | null> {
    const supabase = createServiceRoleClient();

    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({
          status: 'paid' as ReservationStatus,
          payment_provider: params.provider,
          external_payment_id: params.externalPaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.reservationId)
        .select('*')
        .single();

      if (error) {
        console.error(
          `[Server Queries] Failed to mark reservation ${params.reservationId} as paid:`,
          error,
        );
        throw new Error(`Failed to mark reservation as paid: ${error.message}`);
      }

      if (!data) {
        console.error(
          `[Server Queries] No data returned when marking reservation ${params.reservationId} as paid`,
        );
        return null;
      }

      console.log(
        `[Server Queries] Successfully marked reservation ${params.reservationId} as paid`,
      );
      return data as Reservation;
    } catch (error) {
      console.error('[Server Queries] Error in markPaid:', error);
      throw error;
    }
  }

  /**
   * Update reservation status
   *
   * Generic status update method using service role.
   *
   * @param id - Reservation ID
   * @param status - New status
   * @returns Updated reservation or null on error
   */
  static async updateStatus(id: string, status: ReservationStatus): Promise<Reservation | null> {
    const supabase = createServiceRoleClient();

    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error(`[Server Queries] Failed to update status for reservation ${id}:`, error);
        throw new Error(`Failed to update reservation status: ${error.message}`);
      }

      if (!data) {
        console.error(
          `[Server Queries] No data returned when updating status for reservation ${id}`,
        );
        return null;
      }

      return data as Reservation;
    } catch (error) {
      console.error('[Server Queries] Error in updateStatus:', error);
      throw error;
    }
  }

  /**
   * Update reservation with partial data
   *
   * Generic update method using service role.
   * Used for refunds, notes updates, etc.
   *
   * @param id - Reservation ID
   * @param updates - Partial reservation data to update
   * @returns Updated reservation or null on error
   */
  static async update(id: string, updates: Partial<Reservation>): Promise<Reservation | null> {
    const supabase = createServiceRoleClient();

    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error(`[Server Queries] Failed to update reservation ${id}:`, error);
        throw new Error(`Failed to update reservation: ${error.message}`);
      }

      if (!data) {
        console.error(`[Server Queries] No data returned when updating reservation ${id}`);
        return null;
      }

      return data as Reservation;
    } catch (error) {
      console.error('[Server Queries] Error in update:', error);
      throw error;
    }
  }

  /**
   * Get reservation by payment details
   *
   * Finds reservation by payment provider and external payment ID.
   * Uses service role to bypass RLS.
   *
   * @param provider - Payment provider (stripe, paypal)
   * @param externalPaymentId - External payment ID from payment provider
   * @returns Reservation or null if not found
   */
  static async getByPayment(
    provider: PaymentProvider,
    externalPaymentId: string,
  ): Promise<Reservation | null> {
    const supabase = createServiceRoleClient();

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('payment_provider', provider)
        .eq('external_payment_id', externalPaymentId)
        .single();

      if (error) {
        // Not found is OK, return null
        if (error.code === 'PGRST116') {
          return null;
        }

        console.error(
          `[Server Queries] Error getting reservation by payment ${provider}:${externalPaymentId}:`,
          error,
        );
        throw new Error(`Failed to get reservation by payment: ${error.message}`);
      }

      return data as Reservation;
    } catch (error) {
      console.error('[Server Queries] Error in getByPayment:', error);
      return null;
    }
  }

  /**
   * Get reservation by ID
   *
   * Fetches reservation by ID using service role.
   *
   * @param id - Reservation ID
   * @returns Reservation or null if not found
   */
  static async getById(id: string): Promise<Reservation | null> {
    const supabase = createServiceRoleClient();

    try {
      const { data, error } = await supabase.from('reservations').select('*').eq('id', id).single();

      if (error) {
        // Not found is OK, return null
        if (error.code === 'PGRST116') {
          return null;
        }

        console.error(`[Server Queries] Error getting reservation ${id}:`, error);
        return null;
      }

      return data as Reservation;
    } catch (error) {
      console.error('[Server Queries] Error in getById:', error);
      return null;
    }
  }
}
