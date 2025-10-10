/**
 * Reservation Creation Service
 *
 * Handles creating reservations with atomic transactions, puppy availability
 * validation, and payment processing integration.
 */

import type {
  CreateReservationParams,
  CreateReservationResult,
  Reservation,
  CreateWebhookEventParams,
  WebhookEvent,
  PaymentProvider,
} from './types';
import {
  enhancedCreateReservationParamsSchema,
} from './schema';
import { ReservationQueries, WebhookEventQueries } from './queries';
import { idempotencyManager } from './idempotency';
import { createSupabaseClient } from '@/lib/supabase/client';
import { formatCentsToUSD } from '@/lib/utils/currency';

/**
 * Reservation creation service
 */
export class ReservationCreationService {
  /**
   * Create a new reservation with full validation and atomic operations
   */
  static async createReservation(
    params: CreateReservationParams,
    webhookEvent?: CreateWebhookEventParams
  ): Promise<CreateReservationResult> {
    try {
      // Validate input parameters
      const validationResult = enhancedCreateReservationParamsSchema.safeParse(params);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map((e) => e.message).join(', ');
        return {
          success: false,
          error: `Validation error: ${errorMessages}`,
          errorCode: 'VALIDATION_ERROR',
        };
      }

      const validatedParams = validationResult.data;

      // Check idempotency - prevent duplicate reservations
      const idempotencyCheck = await idempotencyManager.checkWebhookEvent(
        validatedParams.paymentProvider,
        validatedParams.externalPaymentId
      );

      if (idempotencyCheck.exists && idempotencyCheck.reservation) {
        return {
          success: true,
          reservation: idempotencyCheck.reservation,
          error: 'Reservation already exists for this payment',
        };
      }

      // Atomically reserve the puppy by updating status from 'available' to 'reserved'
      // This prevents race conditions where two customers try to reserve the same puppy
      const supabase = createSupabaseClient();
      const { data: reservedPuppy, error: reserveError } = await supabase
        .from('puppies')
        .update({ status: 'reserved' })
        .eq('id', validatedParams.puppyId)
        .eq('status', 'available') // CRITICAL: Only update if currently available
        .select('id, price, name, status')
        .single();

      if (reserveError || !reservedPuppy) {
        return {
          success: false,
          error: 'Puppy is no longer available for reservation',
          errorCode: 'RACE_CONDITION_LOST',
        };
      }

      // Validate deposit amount
      if (validatedParams.depositAmount > reservedPuppy.price) {
        // Rollback: revert puppy status back to available
        await supabase
          .from('puppies')
          .update({ status: 'available' })
          .eq('id', validatedParams.puppyId);

        return {
          success: false,
          error: 'Deposit amount cannot exceed puppy price',
          errorCode: 'VALIDATION_ERROR',
        };
      }

      // Prepare reservation data
      const reservationData: Omit<Reservation, 'id' | 'created_at' | 'updated_at'> = {
        puppy_id: validatedParams.puppyId,
        customer_name: validatedParams.customerName?.trim() || null,
        customer_email: validatedParams.customerEmail.toLowerCase().trim(),
        customer_phone: validatedParams.customerPhone?.trim() || null,
        channel: validatedParams.channel || 'site',
        status: 'pending',
        deposit_amount: validatedParams.depositAmount,
        amount: validatedParams.depositAmount,
        payment_provider: validatedParams.paymentProvider,
        external_payment_id: validatedParams.externalPaymentId,
        webhook_event_id: null,
        expires_at: validatedParams.expiresAt?.toISOString() || this.calculateDefaultExpiry(),
        notes: validatedParams.notes?.trim() || null,
      };

      // Create webhook event if provided
      let createdWebhookEvent: WebhookEvent | null = null;
      if (webhookEvent) {
        const webhookResult = await idempotencyManager.createWebhookEvent(webhookEvent);
        if (!webhookResult.success) {
          return {
            success: false,
            error: `Failed to create webhook event: ${webhookResult.error}`,
            errorCode: 'DATABASE_ERROR',
          };
        }
        createdWebhookEvent = webhookResult.webhookEvent || null;
      }

      try {
        // Create the reservation
        const reservation = await ReservationQueries.create(reservationData);

        // Update webhook event with reservation ID if we have one
        if (createdWebhookEvent && reservation.id) {
          await WebhookEventQueries.update(createdWebhookEvent.id, {
            reservation_id: parseInt(reservation.id),
          });
        }

        // NOTE: Puppy status remains 'reserved' after successful reservation creation
        // It will be updated to 'sold' when payment is confirmed or back to 'available' if cancelled/expired

        return {
          success: true,
          reservation,
        };
      } catch (error) {
        // If reservation creation fails, rollback puppy status to available
        console.error('Failed to create reservation:', error);

        await supabase
          .from('puppies')
          .update({ status: 'available' })
          .eq('id', validatedParams.puppyId);

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          errorCode: 'DATABASE_ERROR',
        };
      }
    } catch (error) {
      console.error('Unexpected error in createReservation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorCode: 'DATABASE_ERROR',
      };
    }
  }

  /**
   * Create reservation from completed payment (webhook-triggered)
   */
  static async createFromPayment(
    paymentProvider: PaymentProvider,
    externalPaymentId: string,
    puppyId: string,
    customerEmail: string,
    customerName?: string,
    customerPhone?: string,
    amount?: number,
    webhookEvent?: CreateWebhookEventParams
  ): Promise<CreateReservationResult> {
    const params: CreateReservationParams = {
      puppyId,
      customerEmail,
      customerName,
      customerPhone,
      depositAmount: amount || 0,
      paymentProvider,
      externalPaymentId,
      channel: 'site',
      notes: 'Created from payment webhook',
    };

    return this.createReservation(params, webhookEvent);
  }

  /**
   * Create reservation with immediate payment confirmation
   */
  static async createWithConfirmedPayment(
    params: CreateReservationParams,
    paymentAmount: number,
    webhookEvent?: CreateWebhookEventParams
  ): Promise<CreateReservationResult> {
    // First create as pending
    const result = await this.createReservation(params, webhookEvent);

    if (!result.success || !result.reservation) {
      return result;
    }

    // If payment amount matches, mark as paid immediately
    if (Math.abs(paymentAmount - params.depositAmount) < 0.01) {
      try {
        const updatedReservation = await ReservationQueries.updateStatus(
          result.reservation.id,
          'paid'
        );

        if (updatedReservation) {
          return {
            success: true,
            reservation: updatedReservation,
          };
        }
      } catch (error) {
        console.error('Failed to update reservation to paid:', error);
        // Still return success since reservation was created
      }
    }

    return result;
  }

  /**
   * Calculate default expiration time (24 hours from now)
   */
  private static calculateDefaultExpiry(): string {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return expiry.toISOString();
  }

  /**
   * Validate and format customer information
   */
  private static validateCustomerInfo(
    email: string,
    name?: string,
    phone?: string
  ): {
    valid: boolean;
    error?: string;
    formatted?: {
      email: string;
      name: string | null;
      phone: string | null;
    };
  } {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' };
    }

    // Phone validation (optional)
    if (phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        return { valid: false, error: 'Invalid phone number format' };
      }
    }

    // Name validation (optional)
    if (name && name.trim().length > 100) {
      return { valid: false, error: 'Name too long' };
    }

    return {
      valid: true,
      formatted: {
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        phone: phone?.trim() || null,
      },
    };
  }

  /**
   * Check for duplicate reservations
   */
  private static async checkDuplicateReservation(
    puppyId: string,
    customerEmail: string,
    timeWindowHours: number = 1
  ): Promise<Reservation | null> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - timeWindowHours);

    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('puppy_id', puppyId)
        .ilike('customer_email', customerEmail)
        .gte('created_at', cutoffTime.toISOString())
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      return data[0] as Reservation;
    } catch (err) {
      console.error('Error checking duplicate reservations:', err);
      return null;
    }
  }

  /**
   * Generate reservation confirmation data
   */
  static generateConfirmationData(reservation: Reservation, puppy: {
    name?: string;
    breed_id?: string;
    price?: number;
    gender?: string;
    birth_date?: string;
  }) {
    return {
      reservationId: reservation.id,
      puppyName: puppy?.name || 'Unknown Puppy',
      customerName: reservation.customer_name,
      customerEmail: reservation.customer_email,
      depositAmount: formatCentsToUSD(Math.round(reservation.deposit_amount * 100)),
      paymentProvider: reservation.payment_provider,
      status: reservation.status,
      expiresAt: reservation.expires_at,
      createdAt: reservation.created_at,
      puppyDetails: {
        breed: puppy?.breed_id,
        price: puppy?.price ? formatCentsToUSD(Math.round(puppy.price * 100)) : 'Price not available',
        gender: puppy?.gender,
        birthDate: puppy?.birth_date,
      },
    };
  }

  /**
   * Process reservation expiration
   */
  static async processExpiration(reservationId: string): Promise<boolean> {
    try {
      const reservation = await ReservationQueries.getById(reservationId);
      if (!reservation) {
        return false;
      }

      // Only expire if currently pending and past expiry
      if (
        reservation.status === 'pending' &&
        reservation.expires_at &&
        new Date(reservation.expires_at) < new Date()
      ) {
        const updated = await ReservationQueries.updateStatus(reservationId, 'expired');
        return updated !== null;
      }

      return false;
    } catch (error) {
      console.error('Error processing reservation expiration:', error);
      return false;
    }
  }

  /**
   * Bulk expire old pending reservations
   */
  static async bulkExpirePending(): Promise<number> {
    try {
      return await ReservationQueries.expireOldPending();
    } catch (error) {
      console.error('Error bulk expiring pending reservations:', error);
      return 0;
    }
  }
}

/**
 * Helper function for creating reservations
 */
export async function createReservation(
  params: CreateReservationParams,
  webhookEvent?: CreateWebhookEventParams
): Promise<CreateReservationResult> {
  return ReservationCreationService.createReservation(params, webhookEvent);
}

/**
 * Helper function for creating reservations from payment webhooks
 */
export async function createReservationFromPayment(
  paymentProvider: PaymentProvider,
  externalPaymentId: string,
  puppyId: string,
  customerEmail: string,
  customerName?: string,
  customerPhone?: string,
  amount?: number,
  webhookEvent?: CreateWebhookEventParams
): Promise<CreateReservationResult> {
  return ReservationCreationService.createFromPayment(
    paymentProvider,
    externalPaymentId,
    puppyId,
    customerEmail,
    customerName,
    customerPhone,
    amount,
    webhookEvent
  );
}

/**
 * Helper function for creating confirmed payment reservations
 */
export async function createConfirmedReservation(
  params: CreateReservationParams,
  paymentAmount: number,
  webhookEvent?: CreateWebhookEventParams
): Promise<CreateReservationResult> {
  return ReservationCreationService.createWithConfirmedPayment(
    params,
    paymentAmount,
    webhookEvent
  );
}