/**
 * PayPal Webhook Handler
 *
 * Processes PayPal webhook events and integrates with the reservation
 * service and idempotency manager to ensure safe, atomic operations.
 */

import { ReservationCreationError, ReservationCreationService } from '@/lib/reservations/create';
import { idempotencyManager } from '@/lib/reservations/idempotency';
import { ReservationQueries } from '@/lib/reservations/queries';
import type { ReservationChannel } from '@/lib/reservations/types';
import { trackDepositPaid } from '@/lib/analytics/server-events';
import {
  sendOwnerDepositNotification,
  sendCustomerDepositConfirmation,
} from '@/lib/emails/deposit-notifications';
import {
  sendOwnerRefundNotification,
  sendCustomerRefundNotification,
} from '@/lib/emails/refund-notifications';
import { getPayPalOrder } from './client';
import type {
  PayPalCapture,
  PayPalOrderMetadata,
  PayPalWebhookEvent,
  PayPalWebhookProcessingResult,
} from './types';

interface PayPalCaptureResource extends PayPalCapture {
  custom_id?: string;
  supplementary_data?: {
    related_ids?: {
      order_id?: string;
    };
  };
}

function isPayPalCaptureResource(resource: unknown): resource is PayPalCaptureResource {
  if (!resource || typeof resource !== 'object') {
    return false;
  }

  const candidate = resource as PayPalCaptureResource;
  return typeof candidate.id === 'string' && typeof candidate.amount?.value === 'string';
}

export class PayPalWebhookHandler {
  static async processEvent(
    event: PayPalWebhookEvent<Record<string, unknown>>,
  ): Promise<PayPalWebhookProcessingResult> {
    const { event_type: eventType, id: eventId } = event;
    console.log(`[PayPal Webhook] Received event ${eventType} (${eventId})`);

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        return this.handleCaptureCompleted(event);
      case 'PAYMENT.CAPTURE.REFUNDED':
        return this.handleCaptureRefunded(event);
      case 'CHECKOUT.ORDER.APPROVED':
        await idempotencyManager.createWebhookEvent({
          provider: 'paypal',
          eventId,
          eventType,
          payload: event,
        });
        return {
          success: true,
          eventType,
        };
      default:
        console.log(`[PayPal Webhook] Unhandled event type: ${eventType}`);
        return {
          success: true,
          eventType,
          error: `Unhandled event type: ${eventType}`,
        };
    }
  }

  private static parseMetadata(customId?: string): PayPalOrderMetadata | null {
    if (!customId) {
      return null;
    }

    try {
      return JSON.parse(customId) as PayPalOrderMetadata;
    } catch (error) {
      console.error('[PayPal Webhook] Failed to parse custom_id metadata:', error);
      return null;
    }
  }

  private static async handleCaptureCompleted(
    event: PayPalWebhookEvent<Record<string, unknown>>,
  ): Promise<PayPalWebhookProcessingResult> {
    const eventId = event.id;
    if (!isPayPalCaptureResource(event.resource)) {
      console.error('[PayPal Webhook] Invalid capture resource payload');
      return {
        success: false,
        eventType: event.event_type,
        error: 'Invalid capture resource',
      };
    }

    const capture = event.resource;
    if (!capture || !capture.id) {
      console.error('[PayPal Webhook] Missing capture resource or ID');
      return {
        success: false,
        eventType: event.event_type,
        error: 'Missing capture resource or ID',
      };
    }

    if (capture.status && capture.status !== 'COMPLETED') {
      console.error('[PayPal Webhook] Capture status not completed', capture.status);
      return {
        success: false,
        eventType: event.event_type,
        captureId: capture.id,
        error: `Capture status is ${capture.status}, expected COMPLETED`,
      };
    }

    const captureId = capture.id;
    const orderId = capture.supplementary_data?.related_ids?.order_id;

    const idempotencyCheck = await idempotencyManager.checkWebhookEvent(
      'paypal',
      eventId,
      captureId,
    );

    if (idempotencyCheck.exists) {
      console.log(`[PayPal Webhook] Duplicate event detected: ${eventId}`);
      return {
        success: true,
        eventType: event.event_type,
        captureId,
        duplicate: true,
      };
    }

    const metadata = this.parseMetadata(capture.custom_id);
    if (!metadata || !metadata.puppy_id) {
      console.error('[PayPal Webhook] Missing required metadata (puppy_id)');
      return {
        success: false,
        eventType: event.event_type,
        captureId,
        error: 'Missing required metadata: puppy_id',
      };
    }

    const amountValue = Number.parseFloat(capture.amount?.value ?? '0');
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      console.error('[PayPal Webhook] Invalid capture amount', capture.amount);
      return {
        success: false,
        eventType: event.event_type,
        captureId,
        error: 'Invalid capture amount',
      };
    }

    let customerEmail = metadata.customer_email;
    let customerName = metadata.customer_name;
    let customerPhone = metadata.customer_phone;

    if (orderId) {
      try {
        const orderDetails = await getPayPalOrder(orderId);
        customerEmail = customerEmail ?? orderDetails.payer?.email_address ?? undefined;
        const paypalName = [orderDetails.payer?.name?.given_name, orderDetails.payer?.name?.surname]
          .filter(Boolean)
          .join(' ')
          .trim();
        customerName = metadata.customer_name ?? (paypalName || undefined);
        customerPhone =
          customerPhone ?? orderDetails.payer?.phone?.phone_number?.national_number ?? undefined;
      } catch (error) {
        console.error('[PayPal Webhook] Failed to fetch order details:', error);
      }
    }

    if (!customerEmail) {
      console.error('[PayPal Webhook] Missing customer email');
      return {
        success: false,
        eventType: event.event_type,
        captureId,
        error: 'Missing customer email',
      };
    }

    try {
      const { reservationId } = await ReservationCreationService.createReservation(
        {
          puppyId: metadata.puppy_id,
          customerEmail,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          depositAmount: amountValue,
          paymentProvider: 'paypal',
          externalPaymentId: captureId,
          channel: (metadata.channel || 'site') as ReservationChannel,
          notes: orderId ? `PayPal Order ${orderId}` : 'PayPal capture',
        },
        {
          provider: 'paypal',
          eventId,
          eventType: event.event_type,
          payload: event,
          idempotencyKey: `paypal:${captureId}`,
        },
      );

      console.log(
        `[PayPal Webhook] Reservation created for capture ${captureId}, reservation ID ${reservationId}`,
      );

      // CRITICAL FIX: Update reservation status to 'paid'
      try {
        const updatedReservation = await ReservationQueries.updateStatus(reservationId, 'paid');
        if (!updatedReservation) {
          console.error(
            `[PayPal Webhook] Failed to update reservation ${reservationId} to paid status`,
          );
        } else {
          console.log(`[PayPal Webhook] Reservation ${reservationId} marked as paid`);
        }
      } catch (statusUpdateError) {
        console.error(`[PayPal Webhook] Error updating reservation status:`, statusUpdateError);
        // Non-fatal - reservation exists, emails will still be sent
      }

      await trackDepositPaid({
        value: amountValue,
        currency: capture.amount?.currency_code?.toUpperCase() || 'USD',
        puppy_slug: metadata.puppy_slug,
        puppy_name: metadata.puppy_name,
        payment_provider: 'paypal',
        reservation_id: reservationId,
      });

      const emailData = {
        customerName: customerName || 'Valued Customer',
        customerEmail: customerEmail,
        puppyName: metadata.puppy_name,
        puppySlug: metadata.puppy_slug,
        depositAmount: amountValue,
        currency: capture.amount?.currency_code?.toUpperCase() || 'USD',
        paymentProvider: 'paypal' as const,
        reservationId,
        transactionId: captureId,
      };

      void Promise.all([
        sendOwnerDepositNotification(emailData),
        sendCustomerDepositConfirmation(emailData),
      ]).catch((error) => {
        console.error('[PayPal Webhook] Failed to send email notifications:', error);
      });

      return {
        success: true,
        eventType: event.event_type,
        captureId,
        orderId,
        reservationId,
      };
    } catch (error) {
      if (error instanceof ReservationCreationError) {
        if (error.code === 'RACE_CONDITION_LOST') {
          return {
            success: true,
            eventType: event.event_type,
            captureId,
            duplicate: true,
            error: error.message,
          };
        }

        return {
          success: false,
          eventType: event.event_type,
          captureId,
          error: error.message,
          errorCode: error.code,
        };
      }

      console.error('[PayPal Webhook] Failed to create reservation:', error);

      return {
        success: false,
        eventType: event.event_type,
        captureId,
        error: error instanceof Error ? error.message : 'Failed to create reservation',
      };
    }
  }

  /**
   * Handle PAYMENT.CAPTURE.REFUNDED event
   *
   * Triggered when a PayPal capture is refunded (full or partial).
   * Updates reservation status to 'refunded' and sends email notifications.
   */
  private static async handleCaptureRefunded(
    event: PayPalWebhookEvent<Record<string, unknown>>,
  ): Promise<PayPalWebhookProcessingResult> {
    const { id: eventId, event_type: eventType } = event;
    const resource = event.resource;

    if (!isPayPalCaptureResource(resource)) {
      console.error('[PayPal Webhook] Invalid capture resource on PAYMENT.CAPTURE.REFUNDED');
      return {
        success: false,
        eventType,
        error: 'Invalid capture resource',
      };
    }

    const captureId = resource.id;
    console.log(`[PayPal Webhook] Processing refund for capture: ${captureId}`);

    // Find reservation by capture ID
    const reservation = await ReservationQueries.getByPayment('paypal', captureId).catch(
      (error) => {
        console.error('[PayPal Webhook] Failed to find reservation for refund:', error);
        return null;
      },
    );

    if (!reservation) {
      console.warn(`[PayPal Webhook] No reservation found for capture: ${captureId}`);
      return {
        success: false,
        eventType,
        captureId,
        error: 'Reservation not found',
      };
    }

    console.log(`[PayPal Webhook] Found reservation ${reservation.id} for refund`);

    // Extract refund information from resource
    // PayPal refund events have refund details in the resource
    const refundAmount = parseFloat(resource.amount?.value || '0');
    const refundId = captureId; // PayPal uses capture ID for refund tracking
    const refundReason = 'Customer request'; // PayPal doesn't provide detailed reason in webhook

    // Update reservation status to 'refunded'
    try {
      const refundNote = `[PayPal Refund ${new Date().toISOString()}] Amount: $${refundAmount} ${resource.amount?.currency_code || 'USD'}, Capture ID: ${captureId}`;
      const existingNotes = reservation.notes || '';
      const updatedNotes = existingNotes ? `${existingNotes}\n\n${refundNote}` : refundNote;

      await ReservationQueries.update(reservation.id, {
        status: 'refunded',
        notes: updatedNotes,
      });

      console.log(`[PayPal Webhook] Reservation ${reservation.id} marked as refunded`);
    } catch (error) {
      console.error(`[PayPal Webhook] Error updating reservation status to refunded:`, error);
      return {
        success: false,
        eventType,
        captureId,
        reservationId: reservation.id,
        error: 'Failed to update reservation status',
      };
    }

    // Get puppy details for email
    const { createSupabaseClient } = await import('@/lib/supabase/client');
    const supabase = createSupabaseClient();
    const { data: puppy } = await supabase
      .from('puppies')
      .select('name, slug')
      .eq('id', reservation.puppy_id)
      .single();

    if (!puppy) {
      console.warn(`[PayPal Webhook] Puppy not found for reservation ${reservation.id}`);
    }

    // Send refund notification emails
    const emailData = {
      customerName: reservation.customer_name || 'Valued Customer',
      customerEmail: reservation.customer_email || 'customer@example.com',
      puppyName: puppy?.name || 'Puppy',
      puppySlug: puppy?.slug || '',
      refundAmount,
      currency: resource.amount?.currency_code?.toUpperCase() || 'USD',
      paymentProvider: 'paypal' as const,
      reservationId: reservation.id,
      refundId,
      reason: refundReason,
    };

    void Promise.all([
      sendOwnerRefundNotification(emailData),
      sendCustomerRefundNotification(emailData),
    ]).catch((error) => {
      console.error('[PayPal Webhook] Failed to send refund email notifications:', error);
    });

    // Store webhook event for audit trail
    await idempotencyManager.createWebhookEvent({
      provider: 'paypal',
      eventId,
      eventType,
      idempotencyKey: `paypal:${captureId}:refunded`,
      payload: event,
      reservationId: reservation.id,
    });

    return {
      success: true,
      eventType,
      captureId,
      reservationId: reservation.id,
    };
  }
}
