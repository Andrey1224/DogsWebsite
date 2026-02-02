/**
 * Idempotency Management
 *
 * Utilities for preventing duplicate webhook processing and ensuring
 * safe retry mechanisms for payment operations.
 */

import 'server-only';

import { createServiceRoleClient } from '@/lib/supabase/client';
import type {
  PaymentProvider,
  IdempotencyCheckResult,
  CreateWebhookEventParams,
  CreateWebhookEventResult,
  WebhookEvent,
  ReservationStatus,
} from './types';

/**
 * Idempotency key generator
 */
export class IdempotencyKeyGenerator {
  /**
   * Generate a unique idempotency key for webhook events
   */
  static forWebhook(
    provider: PaymentProvider,
    eventId: string,
    metadata?: Record<string, string>,
  ): string {
    const base = `${provider}:${eventId}`;
    if (!metadata || Object.keys(metadata).length === 0) {
      return base;
    }

    // Sort keys to ensure consistent ordering
    const sortedMetadata = Object.keys(metadata)
      .sort()
      .map((key) => `${key}=${metadata[key]}`)
      .join('&');

    return `${base}:${sortedMetadata}`;
  }

  /**
   * Generate idempotency key for reservation operations
   */
  static forReservation(provider: PaymentProvider, paymentId: string, puppyId: string): string {
    return `${provider}:${paymentId}:${puppyId}`;
  }

  /**
   * Generate timestamp-based key for retry operations
   */
  static forRetry(operation: string, attempt: number): string {
    const timestamp = Date.now();
    return `${operation}:${timestamp}:${attempt}`;
  }
}

/**
 * Idempotency management class
 */
export class IdempotencyManager {
  private supabase = createServiceRoleClient();

  /**
   * Check if a webhook event has already been processed
   */
  async checkWebhookEvent(
    provider: PaymentProvider,
    eventId: string,
    idempotencyKey?: string,
  ): Promise<IdempotencyCheckResult> {
    try {
      // Check by provider and event ID first
      const { data: existingEvent, error: eventError } = await this.supabase
        .from('webhook_events')
        .select('id, processed, processing_started_at, processing_error, payload')
        .eq('provider', provider)
        .eq('event_id', eventId)
        .maybeSingle();

      if (existingEvent && !eventError) {
        // Only treat as duplicate if already processed or currently being processed
        if (existingEvent.processed) {
          return {
            exists: true,
            paymentId: eventId,
            provider,
          };
        }

        // Check if currently being processed (within last 5 minutes)
        if (existingEvent.processing_started_at) {
          const processingStarted = new Date(existingEvent.processing_started_at);
          const now = new Date();
          const minutesSinceStart = (now.getTime() - processingStarted.getTime()) / 1000 / 60;

          if (minutesSinceStart < 5) {
            return {
              exists: true,
              paymentId: eventId,
              provider,
            };
          }
        }

        // Event exists but not processed and not being processed - allow retry
        console.log(`[Idempotency] Event ${eventId} exists but not processed, allowing retry`);
      }

      // If idempotency key is provided, check by key
      if (idempotencyKey) {
        const { data: keyEvent, error: keyError } = await this.supabase
          .from('webhook_events')
          .select('id, processed, processing_started_at, processing_error, payload')
          .eq('provider', provider)
          .eq('idempotency_key', idempotencyKey)
          .maybeSingle();

        if (keyEvent && !keyError) {
          // Only treat as duplicate if already processed or currently being processed
          if (keyEvent.processed) {
            return {
              exists: true,
              paymentId: eventId,
              provider,
            };
          }

          // Check if currently being processed (within last 5 minutes)
          if (keyEvent.processing_started_at) {
            const processingStarted = new Date(keyEvent.processing_started_at);
            const now = new Date();
            const minutesSinceStart = (now.getTime() - processingStarted.getTime()) / 1000 / 60;

            if (minutesSinceStart < 5) {
              return {
                exists: true,
                paymentId: eventId,
                provider,
              };
            }
          }

          // Event exists but not processed and not being processed - allow retry
          console.log(
            `[Idempotency] Event with key ${idempotencyKey} exists but not processed, allowing retry`,
          );
        }
      }

      // Check for existing reservation by payment ID
      const { data: reservation, error: reservationError } = await this.supabase
        .from('reservations')
        .select('id, status, customer_email, external_payment_id')
        .eq('payment_provider', provider)
        .eq('external_payment_id', eventId)
        .maybeSingle();

      if (reservation && !reservationError) {
        return {
          exists: true,
          paymentId: eventId,
          provider,
          reservation: {
            id: reservation.id,
            puppy_id: '', // Will be populated by full query if needed
            customer_name: null,
            customer_email: reservation.customer_email,
            customer_phone: null,
            channel: null,
            status: reservation.status as ReservationStatus,
            deposit_amount: 0,
            amount: 0,
            payment_provider: provider,
            external_payment_id: reservation.external_payment_id,
            webhook_event_id: null,
            expires_at: null,
            notes: null,
            created_at: '',
            updated_at: '',
          },
        };
      }

      return {
        exists: false,
        paymentId: eventId,
        provider,
      };
    } catch (error) {
      console.error('Error checking webhook idempotency:', error);
      return {
        exists: false,
        paymentId: eventId,
        provider,
      };
    }
  }

  /**
   * Create a webhook event with idempotency protection
   */
  async createWebhookEvent(params: CreateWebhookEventParams): Promise<CreateWebhookEventResult> {
    try {
      // Generate idempotency key if not provided
      const idempotencyKey =
        params.idempotencyKey ||
        IdempotencyKeyGenerator.forWebhook(
          params.provider,
          params.eventId,
          params.reservationId ? { reservationId: params.reservationId } : undefined,
        );

      // Check if event already exists
      const existing = await this.checkWebhookEvent(
        params.provider,
        params.eventId,
        idempotencyKey,
      );

      if (existing.exists) {
        return {
          success: true,
          isDuplicate: true,
          webhookEvent: existing.webhookEvent,
        };
      }

      // Create the webhook event
      const { data: event, error } = await this.supabase
        .from('webhook_events')
        .insert({
          provider: params.provider,
          event_id: params.eventId,
          event_type: params.eventType,
          payload: params.payload,
          idempotency_key: idempotencyKey,
          reservation_id: params.reservationId,
          processed: false,
        })
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation
        if (error.code === '23505') {
          return {
            success: true,
            isDuplicate: true,
          };
        }

        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        webhookEvent: {
          id: event.id,
          provider: event.provider as PaymentProvider,
          event_id: event.event_id,
          event_type: event.event_type,
          processed: event.processed,
          processing_started_at: event.processing_started_at,
          processed_at: event.processed_at,
          processing_error: event.processing_error,
          idempotency_key: event.idempotency_key,
          reservation_id: event.reservation_id,
          payload: event.payload,
          created_at: event.created_at,
          updated_at: event.updated_at,
        },
      };
    } catch (error) {
      console.error('Error creating webhook event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Mark a webhook event as processed
   */
  async markAsProcessed(eventId: number, reservationId?: string): Promise<boolean> {
    try {
      const updates: {
        processed: boolean;
        processed_at: string;
        reservation_id?: string;
      } = {
        processed: true,
        processed_at: new Date().toISOString(),
      };

      if (reservationId) {
        updates.reservation_id = reservationId;
      }

      const { error } = await this.supabase
        .from('webhook_events')
        .update(updates)
        .eq('id', eventId);

      return !error;
    } catch (err) {
      console.error('Error marking webhook as processed:', err);
      return false;
    }
  }

  /**
   * Mark a webhook event as failed
   */
  async markAsFailed(eventId: number, error: string): Promise<boolean> {
    try {
      const { error: updateError } = await this.supabase
        .from('webhook_events')
        .update({
          processed: true, // Still mark as processed to avoid retries
          processed_at: new Date().toISOString(),
          processing_error: error,
        })
        .eq('id', eventId);

      return !updateError;
    } catch (error) {
      console.error('Error marking webhook as failed:', error);
      return false;
    }
  }

  /**
   * Lock a webhook event for processing
   */
  async lockForProcessing(eventId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('webhook_events')
        .update({
          processing_started_at: new Date().toISOString(),
        })
        .eq('id', eventId)
        .is('processing_started_at', null)
        .eq('processed', false);

      return !error;
    } catch (err) {
      console.error('Error locking webhook for processing:', err);
      return false;
    }
  }

  /**
   * Cleanup old processed webhook events
   */
  async cleanupOldEvents(daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await this.supabase
        .from('webhook_events')
        .delete()
        .eq('processed', true)
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        console.error('Error cleaning up old webhook events:', error);
        return 0;
      }

      // Return count of deleted events (approximate)
      return 1; // Supabase doesn't return delete count in JS client
    } catch (error) {
      console.error('Error cleaning up old webhook events:', error);
      return 0;
    }
  }

  /**
   * Get pending webhook events for retry
   */
  async getPendingEvents(limit: number = 10): Promise<WebhookEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('webhook_events')
        .select('*')
        .eq('processed', false)
        .or("processing_started_at.is.null,processing_started_at.lt.now() - interval '5 minutes'")
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error || !data) {
        return [];
      }

      return data.map((event) => ({
        id: event.id,
        provider: event.provider as PaymentProvider,
        event_id: event.event_id,
        event_type: event.event_type,
        processed: event.processed,
        processing_started_at: event.processing_started_at,
        processed_at: event.processed_at,
        processing_error: event.processing_error,
        idempotency_key: event.idempotency_key,
        reservation_id: event.reservation_id,
        payload: event.payload,
        created_at: event.created_at,
        updated_at: event.updated_at,
      }));
    } catch (error) {
      console.error('Error getting pending webhook events:', error);
      return [];
    }
  }
}

/**
 * Singleton instance
 */
export const idempotencyManager = new IdempotencyManager();

/**
 * Helper function to check idempotency
 */
export async function checkIdempotency(
  provider: PaymentProvider,
  eventId: string,
  idempotencyKey?: string,
): Promise<IdempotencyCheckResult> {
  return idempotencyManager.checkWebhookEvent(provider, eventId, idempotencyKey);
}

/**
 * Helper function to create webhook event with idempotency
 */
export async function createWebhookEventWithIdempotency(
  params: CreateWebhookEventParams,
): Promise<CreateWebhookEventResult> {
  return idempotencyManager.createWebhookEvent(params);
}
