/**
 * Stripe Webhook Handler
 *
 * Processes Stripe webhook events for payment processing using the existing
 * Phase 2 infrastructure (idempotency management and reservation creation).
 *
 * Handles 4 event types:
 * - checkout.session.completed (immediate payments)
 * - checkout.session.async_payment_succeeded (bank debits, vouchers)
 * - checkout.session.async_payment_failed (failed async payments)
 * - checkout.session.expired (abandoned sessions for analytics)
 *
 * @see https://stripe.com/docs/webhooks
 * @see https://stripe.com/docs/payments/checkout/fulfill-orders
 */

import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';
import { idempotencyManager } from '@/lib/reservations/idempotency';
import { ReservationCreationService, ReservationCreationError } from '@/lib/reservations/create';
import { trackDepositPaid } from '@/lib/analytics/server-events';
import {
  sendOwnerDepositNotification,
  sendCustomerDepositConfirmation,
} from '@/lib/emails/deposit-notifications';
import {
  sendOwnerRefundNotification,
  sendCustomerRefundNotification,
} from '@/lib/emails/refund-notifications';
import { sendAsyncPaymentFailedEmail } from '@/lib/emails/async-payment-failed';
import { createServiceRoleClient } from '@/lib/supabase/client';
import { ReservationServerQueries } from '@/lib/reservations/server-queries';
import { WebhookEventsServer } from '@/lib/webhooks/webhook-events-server';
import type { Json } from '@/lib/supabase/database.types';
import type {
  WebhookProcessingResult,
  StripeCheckoutMetadata,
  TypedCheckoutSession,
} from './types';

let supabaseAdminClient: ReturnType<typeof createServiceRoleClient> | null = null;

function serializeStripeEvent(event: Stripe.Event): Json {
  // Stripe events are plain data objects; JSON round-trip strips methods/non-serializable fields.
  return JSON.parse(JSON.stringify(event)) as Json;
}

const STALE_EVENT_TTL_SECONDS = 60 * 60 * 2; // 2 hours
const REQUIRED_METADATA_FIELDS: Array<keyof StripeCheckoutMetadata> = [
  'puppy_id',
  'puppy_slug',
  'puppy_name',
  'customer_email',
];

function getServiceRoleClient() {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  try {
    supabaseAdminClient = createServiceRoleClient();
    return supabaseAdminClient;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[Stripe Webhook] Service role client unavailable:', message);
    return null;
  }
}

function getPaymentIntentId(session: Stripe.Checkout.Session): string | null {
  const { payment_intent: paymentIntent } = session;
  if (!paymentIntent) {
    return null;
  }

  if (typeof paymentIntent === 'string') {
    return paymentIntent;
  }

  return paymentIntent.id ?? null;
}

function normalizeMetadataValue(value?: string | null): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

function getCheckoutMetadata(session: Stripe.Checkout.Session): {
  metadata: StripeCheckoutMetadata | null;
  missing: string[];
} {
  const metadata = session.metadata as Record<string, string> | null;
  const normalized = {
    puppy_id: metadata?.puppy_id,
    puppy_slug: metadata?.puppy_slug,
    puppy_name: metadata?.puppy_name,
    customer_email: metadata?.customer_email || session.customer_details?.email,
    customer_name:
      normalizeMetadataValue(metadata?.customer_name) || session.customer_details?.name,
    customer_phone:
      normalizeMetadataValue(metadata?.customer_phone) || session.customer_details?.phone,
    channel: normalizeMetadataValue(metadata?.channel),
  };

  const missing = REQUIRED_METADATA_FIELDS.filter(
    (field) => !normalized[field as keyof StripeCheckoutMetadata],
  );

  if (missing.length > 0) {
    return { metadata: null, missing };
  }

  return {
    metadata: normalized as StripeCheckoutMetadata,
    missing,
  };
}

function isUniqueExternalPaymentError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return (
    normalized.includes('unique_external_payment_per_provider') ||
    normalized.includes('duplicate key value') ||
    normalized.includes('external_payment_id')
  );
}

/**
 * Webhook event handler for Stripe events
 */
export class StripeWebhookHandler {
  /**
   * Process a verified Stripe webhook event
   *
   * @param event - Verified Stripe event object
   * @returns Processing result with success status and details
   */
  static async processEvent(event: Stripe.Event): Promise<WebhookProcessingResult> {
    const { type, id: eventId, created } = event;

    if (typeof created === 'number') {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (nowSeconds - created > STALE_EVENT_TTL_SECONDS) {
        console.warn('[Stripe Webhook] Discarding stale event:', eventId);
        return {
          success: false,
          eventType: type,
          error: 'Event is stale and will not be processed',
        };
      }
    }

    console.log(`[Stripe Webhook] Processing event: ${type} (ID: ${eventId})`);

    // Route to appropriate handler based on event type
    switch (type) {
      case 'checkout.session.completed':
        return this.handleCheckoutSessionCompleted(event, eventId);

      case 'checkout.session.async_payment_succeeded':
        return this.handleAsyncPaymentSucceeded(event, eventId);

      case 'checkout.session.async_payment_failed':
        return this.handleAsyncPaymentFailed(event, eventId);

      case 'checkout.session.expired':
        return this.handleSessionExpired(event, eventId);

      case 'charge.refunded':
        return this.handleChargeRefunded(event, eventId);

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${type}`);
        return {
          success: true,
          eventType: type,
          error: `Unhandled event type: ${type}`,
        };
    }
  }

  /**
   * Handle checkout.session.completed event
   *
   * Triggered when:
   * - Customer completes payment with immediate payment methods (cards)
   * - Customer submits payment details for async methods (bank debits)
   *
   * Note: For async payment methods, this fires when the session is completed,
   * but payment may still be pending. Check payment_status to determine if
   * the order should be fulfilled immediately.
   */
  private static async handleCheckoutSessionCompleted(
    event: Stripe.Event,
    eventId: string,
  ): Promise<WebhookProcessingResult> {
    const session = event.data.object as TypedCheckoutSession;
    const { metadata, missing } = getCheckoutMetadata(session);
    if (!metadata) {
      console.warn(
        `[Stripe Webhook] Missing required metadata on checkout.session.completed (missing: ${missing.join(
          ', ',
        )})`,
      );
      return {
        success: true,
        eventType: 'checkout.session.completed',
        error: 'Missing required session metadata',
        skipped: true,
      };
    }

    const paymentIntentId = getPaymentIntentId(session);
    if (!paymentIntentId) {
      console.error('[Stripe Webhook] Missing payment_intent on checkout.session.completed');
      return {
        success: false,
        eventType: 'checkout.session.completed',
        error: 'Missing payment_intent on session',
      };
    }

    // Check for duplicate by payment intent (idempotency)
    const paymentDedupeKey = `stripe:${paymentIntentId}`;
    const idempotencyCheck = await idempotencyManager.checkWebhookEvent(
      'stripe',
      eventId, // Use actual Stripe event ID (evt_...)
      paymentDedupeKey, // Use payment intent for idempotency key
    );

    if (idempotencyCheck.exists) {
      console.log(
        `[Stripe Webhook] Duplicate event detected for payment_intent ${paymentIntentId}; skipping`,
      );
      return {
        success: true,
        eventType: 'checkout.session.completed',
        paymentIntentId,
        duplicate: true,
      };
    }

    // Check payment status - only fulfill if paid
    if (session.payment_status !== 'paid') {
      console.log(
        `[Stripe Webhook] Session ${session.id} completed but payment_status is ${session.payment_status}. Waiting for async_payment_succeeded event.`,
      );

      // Store webhook event for audit trail, but don't create reservation yet
      await idempotencyManager.createWebhookEvent({
        provider: 'stripe',
        eventId,
        eventType: 'checkout.session.completed',
        idempotencyKey: `stripe:${paymentIntentId}`,
        payload: serializeStripeEvent(event),
      });

      return {
        success: true,
        eventType: 'checkout.session.completed',
        paymentIntentId,
        error: 'Payment pending - waiting for async_payment_succeeded',
      };
    }

    // Payment is complete - create reservation
    return this.createReservationFromSession(
      session,
      eventId,
      'checkout.session.completed',
      metadata,
      paymentIntentId,
    );
  }

  /**
   * Handle checkout.session.async_payment_succeeded event
   *
   * Triggered when async payment methods (bank debits, vouchers, etc.)
   * complete successfully after the initial checkout.session.completed event.
   */
  private static async handleAsyncPaymentSucceeded(
    event: Stripe.Event,
    eventId: string,
  ): Promise<WebhookProcessingResult> {
    const session = event.data.object as TypedCheckoutSession;
    const { metadata, missing } = getCheckoutMetadata(session);
    if (!metadata) {
      console.warn(
        `[Stripe Webhook] Missing required metadata on checkout.session.async_payment_succeeded (missing: ${missing.join(
          ', ',
        )})`,
      );
      return {
        success: true,
        eventType: 'checkout.session.async_payment_succeeded',
        error: 'Missing required session metadata',
        skipped: true,
      };
    }

    const paymentIntentId = getPaymentIntentId(session);
    if (!paymentIntentId) {
      console.error(
        '[Stripe Webhook] Missing payment_intent on checkout.session.async_payment_succeeded',
      );
      return {
        success: false,
        eventType: 'checkout.session.async_payment_succeeded',
        error: 'Missing payment_intent on session',
      };
    }

    // Check for duplicate by payment intent (idempotency)
    const paymentDedupeKey = `stripe:${paymentIntentId}`;
    const idempotencyCheck = await idempotencyManager.checkWebhookEvent(
      'stripe',
      eventId, // Use actual Stripe event ID (evt_...)
      paymentDedupeKey, // Use payment intent for idempotency key
    );

    if (idempotencyCheck.exists) {
      console.log(
        `[Stripe Webhook] Duplicate event detected for payment_intent ${paymentIntentId}; skipping`,
      );
      return {
        success: true,
        eventType: 'checkout.session.async_payment_succeeded',
        paymentIntentId,
        duplicate: true,
      };
    }

    // Async payment succeeded - create reservation
    return this.createReservationFromSession(
      session,
      eventId,
      'checkout.session.async_payment_succeeded',
      metadata,
      paymentIntentId,
    );
  }

  /**
   * Handle checkout.session.async_payment_failed event
   *
   * Triggered when async payment methods fail after the customer
   * has completed checkout.
   *
   * Sends email notification to customer explaining what happened
   * and encouraging them to retry with a different payment method.
   */
  private static async handleAsyncPaymentFailed(
    event: Stripe.Event,
    eventId: string,
  ): Promise<WebhookProcessingResult> {
    const session = event.data.object as TypedCheckoutSession;
    const { metadata, missing } = getCheckoutMetadata(session);
    if (!metadata) {
      console.warn(
        `[Stripe Webhook] Missing required metadata on async_payment_failed (missing: ${missing.join(
          ', ',
        )})`,
      );
      return {
        success: true,
        eventType: 'checkout.session.async_payment_failed',
        error: 'Missing required session metadata',
        skipped: true,
      };
    }

    const paymentIntentId = getPaymentIntentId(session);
    if (!paymentIntentId) {
      console.error('[Stripe Webhook] Missing payment_intent on async_payment_failed');
      return {
        success: false,
        eventType: 'checkout.session.async_payment_failed',
        error: 'Missing payment_intent on session',
      };
    }

    console.warn(
      `[Stripe Webhook] Async payment failed for session: ${session.id}, payment_intent: ${session.payment_intent}`,
    );

    // Store webhook event for audit trail
    await idempotencyManager.createWebhookEvent({
      provider: 'stripe',
      eventId,
      eventType: 'checkout.session.async_payment_failed',
      idempotencyKey: `stripe:${paymentIntentId}:failed`,
      payload: serializeStripeEvent(event),
    });

    // Mark as processed since we're done with this event (using service role to bypass RLS)
    await WebhookEventsServer.markProcessed({
      provider: 'stripe',
      eventId,
      idempotencyKey: `stripe:${paymentIntentId}:failed`,
    }).catch((error) => {
      console.error(
        '[Stripe Webhook] Failed to mark async_payment_failed event as processed:',
        error,
      );
    });

    // Send email to customer with helpful information
    const customerEmail = session.customer_details?.email || metadata.customer_email;
    const customerName = session.customer_details?.name || metadata.customer_name || undefined;

    if (customerEmail) {
      void sendAsyncPaymentFailedEmail({
        customerName,
        customerEmail,
        puppyName: metadata.puppy_name,
        puppySlug: metadata.puppy_slug,
      }).catch((error) => {
        console.error('[Stripe Webhook] Failed to send async payment failed email:', error);
      });
    }

    return {
      success: true,
      eventType: 'checkout.session.async_payment_failed',
      paymentIntentId,
      error: 'Async payment failed',
    };
  }

  /**
   * Handle checkout.session.expired event
   *
   * Triggered when a checkout session expires (default: 24 hours)
   * without the customer completing payment.
   *
   * Useful for analytics and abandoned cart tracking.
   */
  private static async handleSessionExpired(
    event: Stripe.Event,
    eventId: string,
  ): Promise<WebhookProcessingResult> {
    const session = event.data.object as TypedCheckoutSession;

    console.log(`[Stripe Webhook] Session expired: ${session.id}`);

    // Store webhook event for analytics
    await idempotencyManager.createWebhookEvent({
      provider: 'stripe',
      eventId,
      eventType: 'checkout.session.expired',
      idempotencyKey: `stripe:${session.id}:expired`,
      payload: serializeStripeEvent(event),
    });

    // Mark as processed since we're done with this event (using service role to bypass RLS)
    await WebhookEventsServer.markProcessed({
      provider: 'stripe',
      eventId,
      idempotencyKey: `stripe:${session.id}:expired`,
    }).catch((error) => {
      console.error('[Stripe Webhook] Failed to mark expired event as processed:', error);
    });

    // TODO: Track abandoned checkout in analytics
    // const metadata = session.metadata as StripeCheckoutMetadata;
    // await trackAnalyticsEvent('checkout_abandoned', {
    //   puppy_id: metadata.puppy_id,
    //   puppy_slug: metadata.puppy_slug,
    //   amount: session.amount_total,
    // });

    return {
      success: true,
      eventType: 'checkout.session.expired',
      error: 'Session expired without payment',
    };
  }

  /**
   * Create reservation from successful payment session
   *
   * Uses Phase 2 infrastructure:
   * - Idempotency checks prevent duplicates
   * - Atomic puppy reservation prevents race conditions
   * - Automatic rollback on failures
   */
  private static async createReservationFromSession(
    session: TypedCheckoutSession,
    eventId: string,
    eventType: 'checkout.session.completed' | 'checkout.session.async_payment_succeeded',
    metadata: StripeCheckoutMetadata,
    paymentIntentId: string,
  ): Promise<WebhookProcessingResult> {
    // CRITICAL FIX: Create webhook event and mark as processing BEFORE any early returns
    // This ensures the webhook event is properly tracked even if we find existing reservation
    await idempotencyManager.createWebhookEvent({
      provider: 'stripe',
      eventId,
      eventType,
      idempotencyKey: `stripe:${paymentIntentId}`,
      payload: {
        event_id: eventId,
        session_id: session.id,
        payment_intent: paymentIntentId,
        metadata,
      },
    });

    // Mark webhook event as being processed (using service role to bypass RLS)
    // This prevents concurrent processing and ensures processing_started_at is set
    try {
      await WebhookEventsServer.markProcessing({
        provider: 'stripe',
        eventId,
        idempotencyKey: `stripe:${paymentIntentId}`,
        eventType,
      });
    } catch (markError) {
      console.error(
        '[Stripe Webhook] CRITICAL: Failed to mark webhook event as processing:',
        markError,
      );
      // This is critical - if we can't mark as processing, webhook might be processed elsewhere
      return {
        success: false,
        eventType,
        paymentIntentId,
        error: 'Failed to mark webhook event as processing',
      };
    }

    // Check for existing reservation by payment intent
    const existingReservation = await ReservationServerQueries.getByPayment(
      'stripe',
      paymentIntentId,
    ).catch((error) => {
      console.error('[Stripe Webhook] Failed to check existing reservation by payment:', error);
      return null;
    });

    if (existingReservation?.id) {
      console.log(
        `[Stripe Webhook] Payment intent ${paymentIntentId} already has reservation ${existingReservation.id}`,
      );

      // If reservation exists but is not marked as paid, mark it as paid now
      if (existingReservation.status !== 'paid') {
        console.log(
          `[Stripe Webhook] Reservation ${existingReservation.id} is in status '${existingReservation.status}', marking as paid`,
        );

        try {
          await ReservationServerQueries.markPaid({
            reservationId: existingReservation.id,
            provider: 'stripe',
            externalPaymentId: paymentIntentId,
          });
          console.log(`[Stripe Webhook] Reservation ${existingReservation.id} marked as paid`);
        } catch (markPaidError) {
          console.error(
            `[Stripe Webhook] Failed to mark existing reservation as paid:`,
            markPaidError,
          );
          // Don't return error - mark webhook as processed to avoid retry loop
        }
      }

      // Mark webhook event as processed
      try {
        await WebhookEventsServer.markProcessed({
          provider: 'stripe',
          eventId,
          idempotencyKey: `stripe:${paymentIntentId}`,
        });
        console.log(`[Stripe Webhook] Webhook event ${eventId} marked as processed`);
      } catch (markError) {
        console.error(
          `[Stripe Webhook] CRITICAL: Failed to mark webhook event as processed:`,
          markError,
        );
      }

      return {
        success: true,
        eventType,
        paymentIntentId,
        duplicate: true,
        skipped: true,
        reservationId: existingReservation.id,
        error: 'Reservation already exists for payment intent',
      };
    }

    if (typeof session.amount_total !== 'number' || session.amount_total <= 0) {
      console.error('[Stripe Webhook] Invalid checkout amount:', session.amount_total);
      return {
        success: false,
        eventType: eventType || 'checkout.session.completed',
        paymentIntentId,
        error: 'Invalid checkout amount',
      };
    }

    console.log(
      `[Stripe Webhook] Creating reservation for puppy_id: ${metadata.puppy_id}, payment_intent: ${paymentIntentId}`,
    );

    const supabase = getServiceRoleClient();

    if (supabase) {
      const { data: existingReservation, error: existingReservationError } = await supabase
        .from('reservations')
        .select('id')
        .eq('puppy_id', metadata.puppy_id)
        .eq('status', 'paid')
        .maybeSingle();

      if (existingReservationError) {
        console.error(
          '[Stripe Webhook] Failed to check existing reservations:',
          existingReservationError.message,
        );
      }

      if (existingReservation) {
        console.log('[Stripe Webhook] Puppy already reserved, skipping duplicate event');
        await supabase
          .from('puppies')
          .update({ status: 'reserved' })
          .eq('id', metadata.puppy_id)
          .neq('status', 'reserved');

        return {
          success: true,
          eventType,
          paymentIntentId,
          duplicate: true,
          error: 'Puppy already reserved',
          reservationId: existingReservation.id,
        };
      }
    }

    try {
      const { reservationId } = await ReservationCreationService.createReservation({
        puppyId: metadata.puppy_id,
        customerEmail: session.customer_details?.email || metadata.customer_email,
        customerName: session.customer_details?.name || metadata.customer_name || undefined,
        customerPhone: session.customer_details?.phone || metadata.customer_phone,
        depositAmount: session.amount_total / 100,
        paymentProvider: 'stripe',
        externalPaymentId: paymentIntentId,
        channel: (metadata.channel || 'site') as
          | 'site'
          | 'whatsapp'
          | 'telegram'
          | 'instagram'
          | 'facebook'
          | 'phone',
        notes: `Stripe Checkout Session: ${session.id}`,
      });

      console.log(`[Stripe Webhook] Successfully created reservation ID: ${reservationId}`);

      // CRITICAL FIX: Mark reservation as paid with service role (bypasses RLS)
      let statusUpdateSucceeded = false;
      try {
        const updatedReservation = await ReservationServerQueries.markPaid({
          reservationId,
          provider: 'stripe',
          externalPaymentId: paymentIntentId,
        });

        if (!updatedReservation) {
          console.error(`[Stripe Webhook] Failed to mark reservation ${reservationId} as paid`);
          return {
            success: false,
            eventType,
            paymentIntentId,
            reservationId,
            error: 'Failed to mark reservation as paid',
          };
        } else {
          console.log(`[Stripe Webhook] Reservation ${reservationId} marked as paid`);
          statusUpdateSucceeded = true;
        }
      } catch (statusUpdateError) {
        console.error(`[Stripe Webhook] Error marking reservation as paid:`, statusUpdateError);
        return {
          success: false,
          eventType,
          paymentIntentId,
          reservationId,
          error:
            statusUpdateError instanceof Error
              ? statusUpdateError.message
              : 'Failed to mark reservation as paid',
        };
      }

      // Only proceed with emails and notifications if status update succeeded
      if (!statusUpdateSucceeded) {
        return {
          success: false,
          eventType,
          paymentIntentId,
          reservationId,
          error: 'Failed to mark reservation as paid',
        };
      }

      if (metadata.puppy_slug) {
        revalidatePath(`/puppies/${metadata.puppy_slug}`);
      }
      revalidatePath('/puppies');

      // Mark webhook event as successfully processed (using service role to bypass RLS)
      try {
        await WebhookEventsServer.markProcessed({
          provider: 'stripe',
          eventId,
          idempotencyKey: `stripe:${paymentIntentId}`,
        });
        console.log(`[Stripe Webhook] Webhook event ${eventId} marked as processed`);
      } catch (markError) {
        console.error(
          `[Stripe Webhook] CRITICAL: Failed to mark webhook event as processed:`,
          markError,
        );
        // This is critical - if we can't mark as processed, webhook will retry
        // But since reservation is already created and marked as paid, we should still return success
        // to avoid duplicate reservations
      }

      await trackDepositPaid({
        value: session.amount_total / 100,
        currency: session.currency?.toUpperCase() || 'USD',
        puppy_slug: metadata.puppy_slug,
        puppy_name: metadata.puppy_name,
        payment_provider: 'stripe',
        reservation_id: reservationId,
      });

      const emailData = {
        customerName: session.customer_details?.name || metadata.customer_name || 'Valued Customer',
        customerEmail: session.customer_details?.email || metadata.customer_email,
        puppyName: metadata.puppy_name,
        puppySlug: metadata.puppy_slug,
        depositAmount: session.amount_total / 100,
        currency: session.currency?.toUpperCase() || 'USD',
        paymentProvider: 'stripe' as const,
        reservationId,
        transactionId: paymentIntentId,
      };

      console.info('[Stripe Webhook] Sending deposit emails', {
        reservationId,
        paymentIntentId,
        customerEmail: emailData.customerEmail,
        ownerEmail: process.env.OWNER_EMAIL,
        depositAmount: emailData.depositAmount,
        currency: emailData.currency,
      });

      void Promise.all([
        sendOwnerDepositNotification(emailData),
        sendCustomerDepositConfirmation(emailData),
      ]).catch((error) => {
        console.error('[Stripe Webhook] Failed to send email notifications:', error);
      });

      return {
        success: true,
        eventType,
        paymentIntentId,
        reservationId,
      };
    } catch (error) {
      if (error instanceof ReservationCreationError) {
        if (error.code === 'RACE_CONDITION_LOST') {
          return {
            success: true,
            eventType,
            paymentIntentId,
            duplicate: true,
            error: error.message,
          };
        }

        if (error.code === 'DATABASE_ERROR' && isUniqueExternalPaymentError(error)) {
          console.info(
            '[Stripe Webhook] Duplicate payment detected via unique constraint, skipping',
            {
              paymentIntentId,
              reservationId: metadata.puppy_id,
            },
          );
          return {
            success: true,
            eventType,
            paymentIntentId,
            duplicate: true,
            skipped: true,
            error: 'Duplicate external payment id',
          };
        }

        return {
          success: false,
          eventType,
          paymentIntentId,
          error: error.message,
          errorCode: error.code,
        };
      }

      console.error('[Stripe Webhook] Failed to create reservation:', error);

      if (isUniqueExternalPaymentError(error)) {
        console.info('[Stripe Webhook] Duplicate payment detected via DB constraint, skipping', {
          paymentIntentId,
          reservationId: metadata.puppy_id,
        });
        return {
          success: true,
          eventType,
          paymentIntentId,
          duplicate: true,
          skipped: true,
          error: 'Duplicate external payment id',
        };
      }

      return {
        success: false,
        eventType,
        paymentIntentId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Handle charge.refunded event
   *
   * Triggered when a charge is refunded (full or partial).
   * Updates reservation status to 'refunded' and sends email notifications.
   */
  private static async handleChargeRefunded(
    event: Stripe.Event,
    eventId: string,
  ): Promise<WebhookProcessingResult> {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id || null;

    if (!paymentIntentId) {
      console.error('[Stripe Webhook] Missing payment_intent on charge.refunded');
      return {
        success: false,
        eventType: 'charge.refunded',
        error: 'Missing payment_intent',
      };
    }

    console.log(`[Stripe Webhook] Processing refund for payment_intent: ${paymentIntentId}`);

    // Find reservation by payment intent (using service role to bypass RLS)
    const reservation = await ReservationServerQueries.getByPayment(
      'stripe',
      paymentIntentId,
    ).catch((error) => {
      console.error('[Stripe Webhook] Failed to find reservation for refund:', error);
      return null;
    });

    if (!reservation) {
      console.warn(`[Stripe Webhook] No reservation found for payment_intent: ${paymentIntentId}`);
      return {
        success: false,
        eventType: 'charge.refunded',
        paymentIntentId,
        error: 'Reservation not found',
      };
    }

    console.log(`[Stripe Webhook] Found reservation ${reservation.id} for refund`);

    // Extract refund information
    const refund = charge.refunds?.data?.[0];
    const refundId = refund?.id || charge.id;
    const refundAmount = charge.amount_refunded / 100; // Convert from cents
    const refundReason = refund?.reason || 'Unknown';

    // Update reservation status to 'refunded' (using service role to bypass RLS)
    try {
      const refundNote = `[Stripe Refund ${new Date().toISOString()}] Amount: $${refundAmount} ${charge.currency?.toUpperCase() || 'USD'}, Reason: ${refundReason}, Refund ID: ${refundId}`;
      const existingNotes = reservation.notes || '';
      const updatedNotes = existingNotes ? `${existingNotes}\n\n${refundNote}` : refundNote;

      await ReservationServerQueries.update(reservation.id, {
        status: 'refunded',
        notes: updatedNotes,
      });

      console.log(`[Stripe Webhook] Reservation ${reservation.id} marked as refunded`);
    } catch (error) {
      console.error(`[Stripe Webhook] Error updating reservation status to refunded:`, error);
      return {
        success: false,
        eventType: 'charge.refunded',
        paymentIntentId,
        reservationId: reservation.id,
        error: 'Failed to update reservation status',
      };
    }

    // Get puppy details for email
    const supabase = supabaseAdminClient || createServiceRoleClient();
    const { data: puppy } = await supabase
      .from('puppies')
      .select('name, slug')
      .eq('id', reservation.puppy_id)
      .single();

    if (!puppy) {
      console.warn(`[Stripe Webhook] Puppy not found for reservation ${reservation.id}`);
    }

    // Send refund notification emails
    const emailData = {
      customerName: reservation.customer_name || 'Valued Customer',
      customerEmail: reservation.customer_email || 'customer@example.com',
      puppyName: puppy?.name || 'Puppy',
      puppySlug: puppy?.slug || '',
      refundAmount,
      currency: charge.currency?.toUpperCase() || 'USD',
      paymentProvider: 'stripe' as const,
      reservationId: reservation.id,
      refundId,
      reason: refundReason,
    };

    void Promise.all([
      sendOwnerRefundNotification(emailData),
      sendCustomerRefundNotification(emailData),
    ]).catch((error) => {
      console.error('[Stripe Webhook] Failed to send refund email notifications:', error);
    });

    // Store webhook event for audit trail
    await idempotencyManager.createWebhookEvent({
      provider: 'stripe',
      eventId,
      eventType: 'charge.refunded',
      idempotencyKey: `stripe:${paymentIntentId}:refunded`,
      payload: serializeStripeEvent(event),
      reservationId: reservation.id,
    });

    // Mark as processed since we're done with this event (using service role to bypass RLS)
    await WebhookEventsServer.markProcessed({
      provider: 'stripe',
      eventId,
      idempotencyKey: `stripe:${paymentIntentId}:refunded`,
    }).catch((error) => {
      console.error('[Stripe Webhook] Failed to mark refund event as processed:', error);
    });

    return {
      success: true,
      eventType: 'charge.refunded',
      paymentIntentId,
      reservationId: reservation.id,
    };
  }
}
