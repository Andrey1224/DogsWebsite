/**
 * Reservation Type Definitions
 *
 * Types for the reservation/deposit system, covering database schema
 * and business logic for puppy reservations.
 */

/**
 * Reservation status (matches database enum)
 */
export type ReservationStatus = 'pending' | 'paid' | 'refunded' | 'canceled';

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
  stripe_payment_intent: string | null;
  payment_provider: PaymentProvider | null;
  paypal_order_id: string | null;
  notes: string | null;
  created_at: string;
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
  /** Stripe payment intent ID (for Stripe payments) */
  stripePaymentIntent?: string;
  /** PayPal order ID (for PayPal payments) */
  paypalOrderId?: string;
  /** Reservation channel */
  channel?: ReservationChannel;
  /** Additional notes */
  notes?: string;
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
  errorCode?: 'PUPPY_NOT_AVAILABLE' | 'DUPLICATE_PAYMENT' | 'DATABASE_ERROR';
}

/**
 * Idempotency check result
 */
export interface IdempotencyCheckResult {
  /** Whether a reservation already exists for this payment */
  exists: boolean;
  /** Existing reservation if found */
  reservation?: Reservation;
  /** Payment ID that was checked */
  paymentId: string;
  /** Payment provider */
  provider: PaymentProvider;
}
