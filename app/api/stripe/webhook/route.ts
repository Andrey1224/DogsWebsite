/**
 * Stripe Webhook API Route
 *
 * Receives and processes Stripe webhook events with signature verification.
 *
 * CRITICAL:
 * - Uses Node.js runtime (required for raw body reading)
 * - Reads raw body BEFORE JSON parsing (required for signature verification)
 * - Verifies webhook signature to ensure authenticity
 *
 * Webhook Events Handled:
 * - checkout.session.completed
 * - checkout.session.async_payment_succeeded
 * - checkout.session.async_payment_failed
 * - checkout.session.expired
 *
 * @see https://stripe.com/docs/webhooks/signatures
 * @see https://stripe.com/docs/webhooks/best-practices
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe, webhookSecret } from '@/lib/stripe/client';
import { StripeWebhookHandler } from '@/lib/stripe/webhook-handler';
import { alertWebhookError, trackWebhookSuccess } from '@/lib/monitoring/webhook-alerts';
import Stripe from 'stripe';

// CRITICAL: Must use Node.js runtime for raw body reading
// Edge runtime does not support stripe.webhooks.constructEvent()
export const runtime = 'nodejs';

/**
 * POST handler for Stripe webhooks
 *
 * Security flow:
 * 1. Read raw body (required for signature verification)
 * 2. Extract Stripe-Signature header
 * 3. Verify signature using stripe.webhooks.constructEvent()
 * 4. Process verified event
 * 5. Return appropriate HTTP status
 *
 * Error handling:
 * - 400 Bad Request: Invalid signature or malformed payload
 * - 500 Internal Server Error: Processing errors (triggers Stripe retry)
 * - 200 OK: Success or duplicate events (no retry needed)
 */
export async function POST(req: NextRequest) {
  try {
    // Step 1: Read raw body (MUST be done before any JSON parsing)
    const rawBody = await req.text();

    // Step 2: Extract Stripe signature header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing Stripe-Signature header');
      return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 });
    }

    if (!webhookSecret) {
      console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Step 3: Verify webhook signature and construct event
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      const error = err as Error;
      console.error(`[Stripe Webhook] Signature verification failed: ${error.message}`);

      // Return 400 to tell Stripe not to retry (invalid signature)
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${error.message}` },
        { status: 400 },
      );
    }

    console.log(`[Stripe Webhook] Verified event: ${event.type} (ID: ${event.id})`);

    // Step 4: Process the verified event
    const result = await StripeWebhookHandler.processEvent(event);

    // Step 5: Return appropriate response
    if (result.success || result.duplicate) {
      // Track successful webhook processing
      trackWebhookSuccess('stripe', event.type).catch((err) => {
        console.error('[Stripe Webhook] Failed to track success:', err);
      });

      // Return 200 OK for both success and duplicates
      // This prevents Stripe from retrying the webhook
      return NextResponse.json(
        {
          received: true,
          eventType: result.eventType,
          duplicate: result.duplicate || false,
          reservationId: result.reservationId ?? null,
        },
        { status: 200 },
      );
    }

    // Processing failed - send alert and return 500 to trigger Stripe retry
    console.error(
      `[Stripe Webhook] Processing failed: ${result.error} (Event: ${event.type}, ID: ${event.id})`,
    );

    // Send alert for failed webhook (non-blocking)
    const session = event.data.object as Stripe.Checkout.Session;
    alertWebhookError({
      provider: 'stripe',
      eventType: event.type,
      eventId: event.id,
      error: result.error || 'Unknown processing error',
      puppyId: session.metadata?.puppy_id,
      customerEmail: session.customer_details?.email || session.metadata?.customer_email,
      timestamp: new Date(),
    }).catch((err) => {
      console.error('[Stripe Webhook] Failed to send alert:', err);
    });

    return NextResponse.json(
      {
        error: result.error || 'Unknown processing error',
        eventType: result.eventType,
      },
      { status: 500 },
    );
  } catch (error) {
    // Unexpected error - return 500 to trigger Stripe retry
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Stripe Webhook] Unexpected error: ${errorMessage}`);

    // Send alert for unexpected errors (non-blocking)
    alertWebhookError({
      provider: 'stripe',
      eventType: 'unknown',
      eventId: 'unknown',
      error: `Unexpected error: ${errorMessage}`,
      timestamp: new Date(),
    }).catch((err) => {
      console.error('[Stripe Webhook] Failed to send alert for unexpected error:', err);
    });

    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 },
    );
  }
}

/**
 * GET handler - return webhook configuration info
 * Useful for debugging and verification
 */
export async function GET() {
  return NextResponse.json({
    status: 'Stripe webhook endpoint active',
    runtime: 'nodejs',
    webhookSecretConfigured: !!webhookSecret,
    supportedEvents: [
      'checkout.session.completed',
      'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed',
      'checkout.session.expired',
    ],
  });
}
