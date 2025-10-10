/**
 * Reservation Type Definitions
 *
 * Types for the reservation/deposit system, covering database schema
 * and business logic for puppy reservations.
 */

/**
 * Reservation status (matches database enum)
 */
export type ReservationStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'expired'
  | 'refunded';

/**
 * Payment provider
 */
export type PaymentProvider = 'stripe' | 'paypal';

/**
 * Reservation channel (how the customer contacted us)
 */
export type ReservationChannel =
  | 'site'
  | 'whatsapp'
  | 'telegram'
  | 'instagram'
  | 'facebook'
  | 'phone';

/**
 * Webhook event processing status
 */
export type WebhookEventStatus = 'pending' | 'processing' | 'processed' | 'failed';

/**
 * Database webhook event record
 * Matches the `webhook_events` table schema
 */
export interface WebhookEvent {
  id: number;
  provider: PaymentProvider;
  event_id: string;
  event_type: string;
  processed: boolean;
  processing_started_at: string | null;
  processed_at: string | null;
  processing_error: string | null;
  idempotency_key: string | null;
  reservation_id: number | null;
  payload: unknown;
  created_at: string;
  updated_at: string;
}

/**
 * Database reservation record
 * Matches the `reservations` table schema
 */
export interface Reservation {
  id: string;
  puppy_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  channel: ReservationChannel | null;
  status: ReservationStatus;
  deposit_amount: number;
  amount: number;
  payment_provider: PaymentProvider | null;
  external_payment_id: string | null;
  webhook_event_id: number | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Reservation with related puppy data
 */
export interface ReservationWithPuppy extends Reservation {
  puppy: {
    id: string;
    name: string;
    breed_id: string;
    status: string;
    price: number;
  };
}

/**
 * Reservation summary for reporting
 */
export interface ReservationSummary {
  total_reservations: number;
  pending_reservations: number;
  paid_reservations: number;
  total_amount: number;
}

/**
 * Parameters for creating a reservation
 */
export interface CreateReservationParams {
  /** Puppy ID (UUID) */
  puppyId: string;
  /** Customer email */
  customerEmail: string;
  /** Customer name (optional) */
  customerName?: string;
  /** Customer phone (optional) */
  customerPhone?: string;
  /** Deposit amount in USD */
  depositAmount: number;
  /** Payment provider */
  paymentProvider: PaymentProvider;
  /** External payment ID (Stripe Payment Intent or PayPal Order ID) */
  externalPaymentId: string;
  /** Reservation channel */
  channel?: ReservationChannel;
  /** Additional notes */
  notes?: string;
  /** When the reservation expires (optional) */
  expiresAt?: Date;
}

/**
 * Parameters for creating a webhook event
 */
export interface CreateWebhookEventParams {
  /** Payment provider */
  provider: PaymentProvider;
  /** Event ID from provider */
  eventId: string;
  /** Event type */
  eventType: string;
  /** Full webhook payload */
  payload: unknown;
  /** Idempotency key for duplicate prevention */
  idempotencyKey?: string;
  /** Related reservation ID */
  reservationId?: number;
}

/**
 * Result of reservation creation
 */
export interface CreateReservationResult {
  /** Whether creation was successful */
  success: boolean;
  /** Created reservation */
  reservation?: Reservation;
  /** Error message if creation failed */
  error?: string;
  /** Error code for specific failure types */
  errorCode?:
    | 'PUPPY_NOT_AVAILABLE'
    | 'RACE_CONDITION_LOST'
    | 'DUPLICATE_PAYMENT'
    | 'DATABASE_ERROR'
    | 'VALIDATION_ERROR'
    | 'PAYMENT_PROVIDER_ERROR';
}

/**
 * Result of webhook event creation
 */
export interface CreateWebhookEventResult {
  /** Whether creation was successful */
  success: boolean;
  /** Created webhook event */
  webhookEvent?: WebhookEvent;
  /** Error message if creation failed */
  error?: string;
  /** Whether this is a duplicate event */
  isDuplicate?: boolean;
}

/**
 * Idempotency check result
 */
export interface IdempotencyCheckResult {
  /** Whether a reservation already exists for this payment */
  exists: boolean;
  /** Existing reservation if found */
  reservation?: Reservation;
  /** Existing webhook event if found */
  webhookEvent?: WebhookEvent;
  /** Payment ID that was checked */
  paymentId: string;
  /** Payment provider */
  provider: PaymentProvider;
}

/**
 * Webhook processing result
 */
export interface WebhookProcessingResult {
  /** Whether processing was successful */
  success: boolean;
  /** Processed webhook event */
  webhookEvent?: WebhookEvent;
  /** Created/updated reservation */
  reservation?: Reservation;
  /** Error message if processing failed */
  error?: string;
  /** Whether to retry processing */
  shouldRetry?: boolean;
}

/**
 * Reservation update parameters
 */
export interface UpdateReservationParams {
  /** Reservation ID */
  id: string;
  /** New status */
  status?: ReservationStatus;
  /** Updated notes */
  notes?: string;
  /** New expiration time */
  expiresAt?: Date;
}
