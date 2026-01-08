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
}
