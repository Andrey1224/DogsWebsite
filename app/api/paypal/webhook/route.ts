import { NextRequest, NextResponse } from 'next/server';

import { PayPalWebhookHandler } from '@/lib/paypal/webhook-handler';
import { verifyPayPalWebhookSignature } from '@/lib/paypal/webhook-verification';
import { alertWebhookError, trackWebhookSuccess } from '@/lib/monitoring/webhook-alerts';
import type { PayPalWebhookEvent } from '@/lib/paypal/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error('[PayPal Webhook] Missing PAYPAL_WEBHOOK_ID environment variable');
    return NextResponse.json({ error: 'PayPal webhook ID is not configured' }, { status: 500 });
  }

  try {
    const rawBody = await request.text();
    const event = JSON.parse(rawBody) as PayPalWebhookEvent<Record<string, unknown>>;

    const transmissionId = request.headers.get('paypal-transmission-id');
    const transmissionSig = request.headers.get('paypal-transmission-sig');
    const transmissionTime = request.headers.get('paypal-transmission-time');
    const certUrl = request.headers.get('paypal-cert-url');
    const authAlgo = request.headers.get('paypal-auth-algo');

    if (!transmissionId || !transmissionSig || !transmissionTime || !certUrl || !authAlgo) {
      console.error('[PayPal Webhook] Missing signature headers');
      return NextResponse.json({ error: 'Missing PayPal signature headers' }, { status: 400 });
    }

    const isSignatureValid = await verifyPayPalWebhookSignature({
      authAlgo,
      certUrl,
      transmissionId,
      transmissionSig,
      transmissionTime,
      webhookId,
      webhookEvent: event,
    });

    if (!isSignatureValid) {
      console.warn('[PayPal Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const result = await PayPalWebhookHandler.processEvent(event);

    if (result.success || result.duplicate) {
      // Track successful webhook processing
      trackWebhookSuccess('paypal', event.event_type).catch((err) => {
        console.error('[PayPal Webhook] Failed to track success:', err);
      });

      return NextResponse.json(
        {
          received: true,
          eventType: result.eventType,
          duplicate: result.duplicate ?? false,
        },
        { status: 200 },
      );
    }

    // Processing failed - send alert and return 500 to trigger PayPal retry
    console.error(
      `[PayPal Webhook] Processing failed: ${result.error} (Event: ${event.event_type}, ID: ${event.id})`,
    );

    // Extract metadata for alert context
    const resource = event.resource as { custom_id?: string };
    let puppyId: string | undefined;
    let customerEmail: string | undefined;

    if (resource.custom_id) {
      try {
        const metadata = JSON.parse(resource.custom_id);
        puppyId = metadata.puppy_id;
        customerEmail = metadata.customer_email;
      } catch {
        // Ignore parse errors
      }
    }

    // Send alert for failed webhook (non-blocking)
    alertWebhookError({
      provider: 'paypal',
      eventType: event.event_type,
      eventId: event.id,
      error: result.error || 'Failed to process PayPal webhook',
      puppyId,
      customerEmail,
      timestamp: new Date(),
    }).catch((err) => {
      console.error('[PayPal Webhook] Failed to send alert:', err);
    });

    return NextResponse.json(
      {
        error: result.error || 'Failed to process PayPal webhook',
        eventType: result.eventType,
      },
      { status: 500 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PayPal Webhook] Error processing request:', message);

    // Send alert for unexpected errors (non-blocking)
    alertWebhookError({
      provider: 'paypal',
      eventType: 'unknown',
      eventId: 'unknown',
      error: `Unexpected error: ${message}`,
      timestamp: new Date(),
    }).catch((err) => {
      console.error('[PayPal Webhook] Failed to send alert for unexpected error:', err);
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
