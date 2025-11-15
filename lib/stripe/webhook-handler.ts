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
import { sendAsyncPaymentFailedEmail } from '@/lib/emails/async-payment-failed';
import { createServiceRoleClient } from '@/lib/supabase/client';
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

    // Check for duplicate event
    const idempotencyCheck = await idempotencyManager.checkWebhookEvent(
      'stripe',
      eventId,
      session.payment_intent as string,
    );

    if (idempotencyCheck.exists) {
      console.log(`[Stripe Webhook] Duplicate event detected: ${eventId}`);
      return {
        success: true,
        eventType: 'checkout.session.completed',
        paymentIntentId: session.payment_intent as string,
        duplicate: true,
      };
    }

    // Extract metadata
    const metadata = session.metadata as StripeCheckoutMetadata;

    if (!metadata || !metadata.puppy_id) {
      console.error('[Stripe Webhook] Missing required metadata: puppy_id');
      return {
        success: false,
        eventType: 'checkout.session.completed',
        error: 'Missing required metadata: puppy_id',
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
        idempotencyKey: `stripe:${session.payment_intent}`,
        payload: serializeStripeEvent(event),
      });

      return {
        success: true,
        eventType: 'checkout.session.completed',
        paymentIntentId: session.payment_intent as string,
        error: 'Payment pending - waiting for async_payment_succeeded',
      };
    }

    // Payment is complete - create reservation
    return this.createReservationFromSession(session, eventId);
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

    // Check for duplicate event
    const idempotencyCheck = await idempotencyManager.checkWebhookEvent(
      'stripe',
      eventId,
      session.payment_intent as string,
    );

    if (idempotencyCheck.exists) {
      console.log(`[Stripe Webhook] Duplicate event detected: ${eventId}`);
      return {
        success: true,
        eventType: 'checkout.session.async_payment_succeeded',
        paymentIntentId: session.payment_intent as string,
        duplicate: true,
      };
    }

    // Async payment succeeded - create reservation
    return this.createReservationFromSession(
      session,
      eventId,
      'checkout.session.async_payment_succeeded',
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

    console.warn(
      `[Stripe Webhook] Async payment failed for session: ${session.id}, payment_intent: ${session.payment_intent}`,
    );

    // Store webhook event for audit trail
    await idempotencyManager.createWebhookEvent({
      provider: 'stripe',
      eventId,
      eventType: 'checkout.session.async_payment_failed',
      idempotencyKey: `stripe:${session.payment_intent}:failed`,
      payload: serializeStripeEvent(event),
    });

    // Send email to customer with helpful information
    const metadata = session.metadata as StripeCheckoutMetadata;
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
      paymentIntentId: session.payment_intent as string,
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
    eventType?: string,
  ): Promise<WebhookProcessingResult> {
    const metadata = session.metadata;
    const paymentIntentId = session.payment_intent as string;

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
          eventType: eventType || 'checkout.session.completed',
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

      if (metadata.puppy_slug) {
        revalidatePath(`/puppies/${metadata.puppy_slug}`);
      }
      revalidatePath('/puppies');

      await idempotencyManager.createWebhookEvent({
        provider: 'stripe',
        eventId,
        eventType: eventType || 'checkout.session.completed',
        idempotencyKey: `stripe:${paymentIntentId}`,
        payload: {
          event_id: eventId,
          session_id: session.id,
          payment_intent: paymentIntentId,
          metadata,
        },
        reservationId,
      });

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

      void Promise.all([
        sendOwnerDepositNotification(emailData),
        sendCustomerDepositConfirmation(emailData),
      ]).catch((error) => {
        console.error('[Stripe Webhook] Failed to send email notifications:', error);
      });

      return {
        success: true,
        eventType: eventType || 'checkout.session.completed',
        paymentIntentId,
        reservationId,
      };
    } catch (error) {
      if (error instanceof ReservationCreationError) {
        if (error.code === 'RACE_CONDITION_LOST') {
          return {
            success: true,
            eventType: eventType || 'checkout.session.completed',
            paymentIntentId,
            duplicate: true,
            error: error.message,
          };
        }

        return {
          success: false,
          eventType: eventType || 'checkout.session.completed',
          paymentIntentId,
          error: error.message,
          errorCode: error.code,
        };
      }

      console.error('[Stripe Webhook] Failed to create reservation:', error);

      return {
        success: false,
        eventType: eventType || 'checkout.session.completed',
        paymentIntentId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
