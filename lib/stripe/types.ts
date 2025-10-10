/**
 * Stripe Type Definitions
 *
 * Custom types for Stripe integration specific to this application.
 * These extend the base Stripe types for our use cases.
 */

import Stripe from 'stripe';

/**
 * Supported Stripe webhook event types for payment processing
 */
export type StripeWebhookEvent =
  | 'checkout.session.completed'
  | 'checkout.session.async_payment_succeeded'
  | 'checkout.session.async_payment_failed'
  | 'checkout.session.expired';

/**
 * Metadata attached to Stripe Checkout Sessions
 *
 * Used to track which puppy the payment is for and customer details
 */
export interface StripeCheckoutMetadata {
  /** Puppy ID (UUID) */
  puppy_id: string;
  /** Puppy slug for URL generation */
  puppy_slug: string;
  /** Customer name */
  customer_name?: string;
  /** Customer email */
  customer_email: string;
  /** Customer phone */
  customer_phone?: string;
  /** Source channel (site, whatsapp, etc.) */
  channel?: string;
}

/**
 * Stripe checkout session with typed metadata
 */
export type TypedCheckoutSession = Stripe.Checkout.Session & {
  metadata: StripeCheckoutMetadata;
};

/**
 * Parameters for creating a Stripe Checkout Session
 */
export interface CreateCheckoutSessionParams {
  /** Puppy ID */
  puppyId: string;
  /** Puppy slug */
  puppySlug: string;
  /** Puppy name for display */
  puppyName: string;
  /** Deposit amount in cents (e.g., 30000 for $300) */
  amountCents: number;
  /** Customer email */
  customerEmail: string;
  /** Customer name (optional) */
  customerName?: string;
  /** Customer phone (optional) */
  customerPhone?: string;
  /** Success redirect URL */
  successUrl: string;
  /** Cancel redirect URL */
  cancelUrl: string;
}

/**
 * Result of webhook event processing
 */
export interface WebhookProcessingResult {
  /** Whether the event was processed successfully */
  success: boolean;
  /** Event type */
  eventType: string;
  /** Payment intent ID (for idempotency) */
  paymentIntentId?: string;
  /** Error message if processing failed */
  error?: string;
  /** Whether this was a duplicate event */
  duplicate?: boolean;
}
