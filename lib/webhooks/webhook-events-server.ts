/**
 * Server-Side Webhook Events Management
 *
 * Database operations for webhook_events that require elevated permissions
 * (service role). This file is server-only and MUST NOT be imported
 * in client components.
 *
 * CRITICAL:
 * - Uses Supabase service role to bypass RLS
 * - Only for server-side code (API routes, webhooks)
 * - webhook_events table has RLS requiring service_role for all operations
 */

import 'server-only';

import { createServiceRoleClient } from '@/lib/supabase/client';
import type { PaymentProvider } from '@/lib/reservations/types';

export interface MarkProcessingParams {
  provider: PaymentProvider;
  eventId: string;
  idempotencyKey: string;
  eventType: string;
  reservationId?: string;
}

export interface MarkProcessedParams {
  provider: PaymentProvider;
  eventId: string;
  idempotencyKey: string;
}

export interface MarkFailedParams {
  provider: PaymentProvider;
  eventId: string;
  idempotencyKey: string;
  error: string;
}

/**
 * Server-side webhook events operations using service role
 */
export class WebhookEventsServer {
  /**
   * Mark webhook event as being processed
   *
   * Sets processing_started_at to prevent concurrent processing.
   * Call this at the START of webhook processing.
   *
   * IMPORTANT: Throws error if no rows were updated (indicates RLS or missing event)
   *
   * @param params - Event identification and metadata
   * @throws Error if no webhook event found or update failed
   */
  static async markProcessing(params: MarkProcessingParams): Promise<void> {
    const supabase = createServiceRoleClient();

    try {
      // Try to update by provider + event_id first
      const { data, error } = await supabase
        .from('webhook_events')
        .update({
          processing_started_at: new Date().toISOString(),
          reservation_id: params.reservationId,
        })
        .eq('provider', params.provider)
        .eq('event_id', params.eventId)
        .select('id');

      if (error) {
        console.error(
          `[Webhook Events Server] Failed to mark event as processing (provider=${params.provider}, event_id=${params.eventId}):`,
          error,
        );
        throw new Error(`Failed to mark webhook event as processing: ${error.message}`);
      }

      if (data && data.length > 0) {
        console.log(
          `[Webhook Events Server] Marked event as processing: ${params.provider}:${params.eventId} (${data.length} row(s))`,
        );
        return;
      }

      // Fallback: Try by idempotency_key
      const { data: keyData, error: keyError } = await supabase
        .from('webhook_events')
        .update({
          processing_started_at: new Date().toISOString(),
          reservation_id: params.reservationId,
        })
        .eq('idempotency_key', params.idempotencyKey)
        .select('id');

      if (keyError) {
        console.error(
          `[Webhook Events Server] Failed to mark event as processing by key (key=${params.idempotencyKey}):`,
          keyError,
        );
        throw new Error(`Failed to mark webhook event as processing: ${keyError.message}`);
      }

      if (keyData && keyData.length > 0) {
        console.log(
          `[Webhook Events Server] Marked event as processing by key: ${params.idempotencyKey} (${keyData.length} row(s))`,
        );
        return;
      }

      // No rows updated - this is a critical error
      console.error(
        `[Webhook Events Server] CRITICAL: No webhook_event found to mark as processing`,
        {
          provider: params.provider,
          eventId: params.eventId,
          idempotencyKey: params.idempotencyKey,
        },
      );
      throw new Error(
        `No webhook event found to mark as processing: ${params.provider}:${params.eventId}`,
      );
    } catch (error) {
      console.error('[Webhook Events Server] Error in markProcessing:', error);
      throw error;
    }
  }

  /**
   * Mark webhook event as successfully processed
   *
   * Sets processed=true, processed_at=now(), processing_error=null.
   * Call this AFTER successful webhook processing.
   *
   * IMPORTANT: Throws error if no rows were updated (indicates RLS or missing event)
   *
   * @param params - Event identification
   * @throws Error if no webhook event found or update failed
   */
  static async markProcessed(params: MarkProcessedParams): Promise<void> {
    const supabase = createServiceRoleClient();

    try {
      // Try to update by provider + event_id first
      const { data, error } = await supabase
        .from('webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          processing_error: null,
        })
        .eq('provider', params.provider)
        .eq('event_id', params.eventId)
        .select('id');

      if (error) {
        console.error(
          `[Webhook Events Server] Failed to mark event as processed (provider=${params.provider}, event_id=${params.eventId}):`,
          error,
        );
        throw new Error(`Failed to mark webhook event as processed: ${error.message}`);
      }

      if (data && data.length > 0) {
        console.log(
          `[Webhook Events Server] Marked event as processed: ${params.provider}:${params.eventId} (${data.length} row(s))`,
        );
        return;
      }

      // Fallback: Try by idempotency_key
      const { data: keyData, error: keyError } = await supabase
        .from('webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          processing_error: null,
        })
        .eq('idempotency_key', params.idempotencyKey)
        .select('id');

      if (keyError) {
        console.error(
          `[Webhook Events Server] Failed to mark event as processed by key (key=${params.idempotencyKey}):`,
          keyError,
        );
        throw new Error(`Failed to mark webhook event as processed: ${keyError.message}`);
      }

      if (keyData && keyData.length > 0) {
        console.log(
          `[Webhook Events Server] Marked event as processed by key: ${params.idempotencyKey} (${keyData.length} row(s))`,
        );
        return;
      }

      // No rows updated - this is a critical error
      console.error(
        `[Webhook Events Server] CRITICAL: No webhook_event found to mark as processed`,
        {
          provider: params.provider,
          eventId: params.eventId,
          idempotencyKey: params.idempotencyKey,
        },
      );
      throw new Error(
        `No webhook event found to mark as processed: ${params.provider}:${params.eventId}`,
      );
    } catch (error) {
      console.error('[Webhook Events Server] Error in markProcessed:', error);
      throw error;
    }
  }

  /**
   * Mark webhook event as failed
   *
   * Sets processing_error and keeps processed=false for potential retry.
   *
   * @param params - Event identification and error message
   * @returns True if successful
   */
  static async markFailed(params: MarkFailedParams): Promise<boolean> {
    const supabase = createServiceRoleClient();

    try {
      // Try to update by provider + event_id first
      const { data, error } = await supabase
        .from('webhook_events')
        .update({
          processed: false,
          processing_error: params.error,
          processed_at: new Date().toISOString(),
        })
        .eq('provider', params.provider)
        .eq('event_id', params.eventId)
        .select('id')
        .maybeSingle();

      if (error) {
        console.error(
          `[Webhook Events Server] Failed to mark event as failed (provider=${params.provider}, event_id=${params.eventId}):`,
          error,
        );
        return false;
      }

      if (data) {
        console.log(
          `[Webhook Events Server] Marked event as failed: ${params.provider}:${params.eventId}`,
        );
        return true;
      }

      // Fallback: Try by idempotency_key
      const { data: keyData, error: keyError } = await supabase
        .from('webhook_events')
        .update({
          processed: false,
          processing_error: params.error,
          processed_at: new Date().toISOString(),
        })
        .eq('idempotency_key', params.idempotencyKey)
        .select('id')
        .maybeSingle();

      if (keyError) {
        console.error(
          `[Webhook Events Server] Failed to mark event as failed by key (key=${params.idempotencyKey}):`,
          keyError,
        );
        return false;
      }

      if (keyData) {
        console.log(
          `[Webhook Events Server] Marked event as failed by key: ${params.idempotencyKey}`,
        );
        return true;
      }

      console.warn(
        `[Webhook Events Server] No webhook_event found to mark as failed: ${params.provider}:${params.eventId}`,
      );
      return false;
    } catch (error) {
      console.error('[Webhook Events Server] Error in markFailed:', error);
      return false;
    }
  }
}
