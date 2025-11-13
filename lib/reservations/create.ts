/**
 * Reservation Creation Service
 *
 * Handles creating reservations with atomic transactions, puppy availability
 * validation, and payment processing integration.
 */

import type {
  CreateReservationParams,
  CreateReservationResponse,
  Reservation,
  CreateWebhookEventParams,
  WebhookEvent,
  PaymentProvider,
  ReservationCreationErrorCode,
} from './types';
import {
  enhancedCreateReservationParamsSchema,
} from './schema';
import { ReservationQueries, WebhookEventQueries } from './queries';
import { idempotencyManager } from './idempotency';
import { createSupabaseClient } from '@/lib/supabase/client';
import { formatCentsToUSD } from '@/lib/utils/currency';

export class ReservationCreationError extends Error {
  constructor(
    message: string,
    public code: ReservationCreationErrorCode
  ) {
    super(message);
    this.name = 'ReservationCreationError';
  }
}

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
  ): Promise<CreateReservationResponse> {
    try {
      // Validate input parameters
      const validationResult = enhancedCreateReservationParamsSchema.safeParse(params);
      if (!validationResult.success) {
        const errorMessages = validationResult.error.issues.map((e) => e.message).join(', ');
        throw new ReservationCreationError(
          `Validation error: ${errorMessages}`,
          'VALIDATION_ERROR'
        );
      }

      const validatedParams = validationResult.data;
      const supabase = createSupabaseClient();

      // Check idempotency - prevent duplicate reservations
      const idempotencyCheck = await idempotencyManager.checkWebhookEvent(
        validatedParams.paymentProvider,
        validatedParams.externalPaymentId
      );

      if (idempotencyCheck.exists) {
        if (idempotencyCheck.reservation?.id) {
          return { reservationId: idempotencyCheck.reservation.id };
        }

        const existingReservation = await ReservationQueries.getByPayment(
          validatedParams.paymentProvider,
          validatedParams.externalPaymentId
        );

        if (existingReservation?.id) {
          return { reservationId: existingReservation.id };
        }
      }

      const sanitizedCustomerName = validatedParams.customerName?.trim() || null;
      const sanitizedCustomerEmail = validatedParams.customerEmail.toLowerCase().trim();
      const sanitizedCustomerPhone = validatedParams.customerPhone?.trim() || null;
      const sanitizedChannel = validatedParams.channel || 'site';
      const sanitizedNotes = validatedParams.notes?.trim() || null;
      const expiresAt =
        validatedParams.expiresAt?.toISOString() || this.calculateDefaultExpiry();

      // Create webhook event if provided
      let createdWebhookEvent: WebhookEvent | null = null;
      if (webhookEvent) {
        const webhookResult = await idempotencyManager.createWebhookEvent(webhookEvent);
        if (!webhookResult.success) {
          throw new ReservationCreationError(
            `Failed to create webhook event: ${webhookResult.error}`,
            'DATABASE_ERROR'
          );
        }
        createdWebhookEvent = webhookResult.webhookEvent || null;
      }

      const { data, error: transactionError } = await supabase
        .rpc('create_reservation_transaction', {
          p_puppy_id: validatedParams.puppyId,
          p_customer_name: sanitizedCustomerName,
          p_customer_email: sanitizedCustomerEmail,
          p_customer_phone: sanitizedCustomerPhone,
          p_channel: sanitizedChannel,
          p_deposit_amount: validatedParams.depositAmount,
          p_amount: validatedParams.depositAmount,
          p_payment_provider: validatedParams.paymentProvider,
          p_external_payment_id: validatedParams.externalPaymentId,
          p_expires_at: expiresAt,
          p_notes: sanitizedNotes,
        })
        .single();

      if (transactionError || !data) {
        const message =
          transactionError?.message ||
          (transactionError as { details?: string } | undefined)?.details ||
          'Failed to create reservation';
        const normalizedMessage = message.toUpperCase();

        if (normalizedMessage.includes('PUPPY_NOT_AVAILABLE')) {
          throw new ReservationCreationError(
            'Puppy is no longer available for reservation',
            'RACE_CONDITION_LOST'
          );
        }

        if (normalizedMessage.includes('PUPPY_NOT_FOUND')) {
          throw new ReservationCreationError('Puppy not found', 'PUPPY_NOT_AVAILABLE');
        }

        if (normalizedMessage.includes('DEPOSIT_EXCEEDS_PRICE')) {
          throw new ReservationCreationError(
            'Deposit amount cannot exceed puppy price',
            'VALIDATION_ERROR'
          );
        }

        throw new ReservationCreationError(message, 'DATABASE_ERROR');
      }

      const reservationData = data as Partial<Reservation> & { reservation_id?: string };
      const reservationId =
        reservationData.id ?? reservationData.reservation_id;

      if (!reservationId) {
        throw new ReservationCreationError(
          'Reservation ID not returned by transaction',
          'DATABASE_ERROR'
        );
      }

      // Update webhook event with reservation ID if we have one
      if (createdWebhookEvent) {
        await WebhookEventQueries.update(createdWebhookEvent.id, {
          reservation_id: reservationId,
        });
      }

      return { reservationId };
    } catch (error) {
      if (error instanceof ReservationCreationError) {
        throw error;
      }

      console.error('Unexpected error in createReservation:', error);
      throw new ReservationCreationError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        'DATABASE_ERROR'
      );
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
  ): Promise<CreateReservationResponse> {
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
  ): Promise<CreateReservationResponse> {
    // First create as pending
    const { reservationId } = await this.createReservation(params, webhookEvent);

    // If payment amount matches, mark as paid immediately
    if (Math.abs(paymentAmount - params.depositAmount) < 0.01) {
      try {
        await ReservationQueries.updateStatus(reservationId, 'paid');
      } catch (error) {
        console.error('Failed to update reservation to paid:', error);
      }
    }

    return { reservationId };
  }

  /**
   * Calculate default expiration time (24 hours from now)
   */
  private static calculateDefaultExpiry(): string {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);
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
): Promise<CreateReservationResponse> {
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
): Promise<CreateReservationResponse> {
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
): Promise<CreateReservationResponse> {
  return ReservationCreationService.createWithConfirmedPayment(
    params,
    paymentAmount,
    webhookEvent
  );
}
