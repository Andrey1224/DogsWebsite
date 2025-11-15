/**
 * Stripe Client Configuration
 *
 * Initializes the Stripe SDK with proper configuration for webhook handling
 * and payment processing.
 *
 * @see https://stripe.com/docs/api
 */

import Stripe from 'stripe';

// Validate required environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    'Missing STRIPE_SECRET_KEY environment variable. ' + 'Please add it to your .env.local file.',
  );
}

/**
 * Stripe client instance
 *
 * Configuration:
 * - apiVersion: Latest stable API version
 * - typescript: true - Enables TypeScript type definitions
 * - appInfo: Identifies this integration
 */
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
  appInfo: {
    name: 'ExoticBulldogLevel',
    version: '1.0.0',
  },
});

/**
 * Webhook secret for signature verification
 *
 * CRITICAL: This must match the webhook secret from Stripe Dashboard
 * Use different secrets for test and live mode
 */
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

if (!webhookSecret) {
  console.warn(
    'WARNING: STRIPE_WEBHOOK_SECRET is not set. ' + 'Webhook signature verification will fail.',
  );
}
