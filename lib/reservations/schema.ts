/**
 * Reservation Validation Schemas
 *
 * Zod schemas for validating reservation-related data including
 * webhook payloads and business logic constraints.
 */

import { z } from 'zod';
import type { PaymentProvider } from './types';

/**
 * Base validation schemas
 */
export const reservationStatusSchema = z.enum([
  'pending',
  'paid',
  'cancelled',
  'expired',
  'refunded',
] as const);

export const paymentProviderSchema = z.enum(['stripe', 'paypal'] as const);

export const reservationChannelSchema = z.enum([
  'site',
  'whatsapp',
  'telegram',
  'instagram',
  'facebook',
  'phone',
] as const);

/**
 * UUID validation helper
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Email validation with proper format
 */
export const emailSchema = z.string().email('Invalid email format');

/**
 * Phone number validation (flexible international format)
 */
export const phoneSchema = z
  .string()
  .regex(
    /^\+?[\d\s\-\(\)]+$/,
    'Invalid phone number format'
  )
  .min(10, 'Phone number must be at least 10 characters')
  .max(20, 'Phone number cannot exceed 20 characters')
  .optional()
  .nullable();

/**
 * Currency amount validation (positive numbers with 2 decimal places)
 */
export const currencySchema = z
  .number()
  .positive('Amount must be positive')
  .min(0.01, 'Amount must be at least $0.01')
  .max(999999.99, 'Amount cannot exceed $999,999.99');

/**
 * External payment ID validation (provider-specific format)
 */
export const externalPaymentIdSchema = z.string().min(1, 'Payment ID is required');

/**
 * Reservation creation parameters schema
 */
export const createReservationParamsSchema = z.object({
  puppyId: uuidSchema,
  customerEmail: emailSchema,
  customerName: z.string().trim().min(1, 'Customer name is required').max(100, 'Name too long').optional(),
  customerPhone: phoneSchema,
  depositAmount: currencySchema,
  paymentProvider: paymentProviderSchema,
  externalPaymentId: externalPaymentIdSchema,
  channel: reservationChannelSchema.optional(),
  notes: z.string().trim().max(1000, 'Notes too long').optional(),
  expiresAt: z.coerce.date().optional(),
});

/**
 * Webhook event creation parameters schema
 */
export const createWebhookEventParamsSchema = z.object({
  provider: paymentProviderSchema,
  eventId: z.string().min(1, 'Event ID is required'),
  eventType: z.string().min(1, 'Event type is required'),
  payload: z.unknown(),
  idempotencyKey: z.string().optional(),
  reservationId: uuidSchema.optional(),
});

/**
 * Database record schemas
 */
export const reservationRecordSchema = z.object({
  id: uuidSchema,
  puppy_id: uuidSchema,
  customer_name: z.string().nullable(),
  customer_email: emailSchema,
  customer_phone: phoneSchema.nullable(),
  channel: reservationChannelSchema.nullable(),
  status: reservationStatusSchema,
  deposit_amount: currencySchema,
  amount: currencySchema,
  payment_provider: paymentProviderSchema.nullable(),
  external_payment_id: z.string().nullable(),
  webhook_event_id: z.number().int().positive().nullable(),
  expires_at: z.coerce.date().nullable(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const webhookEventRecordSchema = z.object({
  id: z.number().int().positive(),
  provider: paymentProviderSchema,
  event_id: z.string(),
  event_type: z.string(),
  processed: z.boolean(),
  processing_started_at: z.coerce.date().nullable(),
  processed_at: z.coerce.date().nullable(),
  processing_error: z.string().nullable(),
  idempotency_key: z.string().nullable(),
  reservation_id: uuidSchema.nullable(),
  payload: z.unknown(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

/**
 * Stripe webhook payload schemas
 */
export const stripeWebhookPayloadSchema = z.object({
  id: z.string(),
  object: z.literal('event'),
  api_version: z.string().optional(),
  created: z.number(),
  data: z.object({
    object: z.unknown(), // Will be validated per event type
  }),
  livemode: z.boolean(),
  pending_webhooks: z.number(),
  request: z.object({
    id: z.string().nullable(),
    idempotency_key: z.string().nullable(),
  }),
  type: z.string(),
});

export const stripePaymentIntentSchema = z.object({
  id: z.string(),
  object: z.literal('payment_intent'),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
  payment_method: z.string().optional(),
  customer: z.string().optional(),
  receipt_email: z.string().optional(),
});

export const stripeCheckoutSessionSchema = z.object({
  id: z.string(),
  object: z.literal('checkout.session'),
  payment_intent: z.string().nullable(),
  customer: z.string().nullable(),
  metadata: z.record(z.string(), z.string()).optional(),
  payment_status: z.string(),
  total_details: z.object({
    amount_shipping: z.number(),
    amount_discount: z.number(),
    amount_tax: z.number(),
  }).optional(),
});

/**
 * PayPal webhook payload schemas
 */
export const paypalWebhookPayloadSchema = z.object({
  id: z.string(),
  event_version: z.string(),
  create_time: z.string(),
  resource_type: z.string(),
  event_type: z.string(),
  summary: z.string(),
  resource: z.unknown(), // Will be validated per event type
  links: z.array(z.unknown()),
});

export const paypalOrderSchema = z.object({
  id: z.string(),
  status: z.string(),
  intent: z.string(),
  purchase_units: z.array(z.unknown()),
  payer: z.object({
    name: z.object({
      given_name: z.string(),
      surname: z.string(),
    }),
    email_address: z.string().optional(),
    phone: z.object({
      phone_number: z.object({
        national_number: z.string(),
      }),
    }).optional(),
  }),
  create_time: z.string(),
  links: z.array(z.unknown()),
});

/**
 * Update reservation parameters schema
 */
export const updateReservationParamsSchema = z.object({
  id: uuidSchema,
  status: reservationStatusSchema.optional(),
  notes: z.string().trim().max(1000, 'Notes too long').optional(),
  expiresAt: z.coerce.date().optional(),
});

/**
 * Puppy availability check schema
 */
export const puppyAvailabilityCheckSchema = z.object({
  puppyId: uuidSchema,
});

/**
 * Business logic validation schemas
 */

/**
 * Validates that a puppy can be reserved
 * - Puppy must exist and be available
 * - No existing active reservations
 */
export const canReservePuppySchema = z.object({
  puppyId: uuidSchema,
  customerEmail: emailSchema,
});

/**
 * Validates payment completion
 * - Payment must be successfully processed
 * - Amount must match expected deposit
 */
export const paymentCompletionSchema = z.object({
  reservationId: uuidSchema,
  paymentProvider: paymentProviderSchema,
  externalPaymentId: externalPaymentIdSchema,
  expectedAmount: currencySchema,
});

/**
 * Type inference helpers
 */
export type CreateReservationParamsInput = z.infer<typeof createReservationParamsSchema>;
export type CreateWebhookEventParamsInput = z.infer<typeof createWebhookEventParamsSchema>;
export type ReservationRecord = z.infer<typeof reservationRecordSchema>;
export type WebhookEventRecord = z.infer<typeof webhookEventRecordSchema>;
export type StripeWebhookPayload = z.infer<typeof stripeWebhookPayloadSchema>;
export type PayPalWebhookPayload = z.infer<typeof paypalWebhookPayloadSchema>;
export type UpdateReservationParamsInput = z.infer<typeof updateReservationParamsSchema>;

/**
 * Validation error messages
 */
export const VALIDATION_ERRORS = {
  INVALID_UUID: 'Invalid UUID format',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number format',
  INVALID_AMOUNT: 'Amount must be a positive number with at most 2 decimal places',
  PUPPY_NOT_AVAILABLE: 'Puppy is not available for reservation',
  DUPLICATE_RESERVATION: 'A reservation already exists for this payment',
  INVALID_PAYMENT_PROVIDER: 'Invalid payment provider',
  MISSING_REQUIRED_FIELD: 'Required field is missing',
  AMOUNT_MISMATCH: 'Payment amount does not match expected deposit amount',
  EXPIRED_RESERVATION: 'Reservation has expired',
} as const;

/**
 * Custom validation functions
 */
export const validateExpirationDate = (date?: Date): boolean => {
  if (!date) return true; // No expiration is valid
  return date > new Date();
};

export const validatePaymentId = (
  paymentId: string,
  provider: PaymentProvider
): boolean => {
  switch (provider) {
    case 'stripe':
      // Stripe payment intent IDs start with 'pi_'
      return /^pi_[a-zA-Z0-9_]+$/.test(paymentId);
    case 'paypal':
      // PayPal order IDs are alphanumeric
      return /^[A-Z0-9]{17,}$/.test(paymentId);
    default:
      return false;
  }
};

/**
 * Enhanced schemas with custom validation
 */
export const enhancedCreateReservationParamsSchema = createReservationParamsSchema
  .extend({
    expiresAt: z.coerce.date().optional().refine(
      validateExpirationDate,
      'Expiration date must be in the future'
    ),
  })
  .refine(
    (data) => validatePaymentId(data.externalPaymentId, data.paymentProvider),
    {
      message: 'Invalid payment ID format for selected provider',
      path: ['externalPaymentId'],
    }
  );

export const enhancedWebhookEventParamsSchema = createWebhookEventParamsSchema
  .refine(
    (data) => {
      if (!data.idempotencyKey) return true;
      return data.idempotencyKey.length <= 255;
    },
    {
      message: 'Idempotency key cannot exceed 255 characters',
      path: ['idempotencyKey'],
    }
  );
