/**
 * Server Actions for Puppy Detail Page
 *
 * Handles server-side operations for puppy reservations including
 * Stripe Checkout Session creation.
 *
 * @see https://stripe.com/docs/payments/checkout/how-checkout-works
 */

'use server';

import { stripe } from '@/lib/stripe/client';
import { getPuppyBySlug } from '@/lib/supabase/queries';
import type { CreateCheckoutSessionParams } from '@/lib/stripe/types';

/**
 * Result of checkout session creation
 */
export interface CreateCheckoutSessionResult {
  success: boolean;
  sessionUrl?: string;
  error?: string;
  errorCode?: 'PUPPY_NOT_FOUND' | 'PUPPY_NOT_AVAILABLE' | 'STRIPE_ERROR';
}

/**
 * Create a Stripe Checkout Session for puppy deposit payment
 *
 * Flow:
 * 1. Validate puppy exists and is available
 * 2. Create Stripe Checkout Session with metadata
 * 3. Return session URL for client redirect
 *
 * @param puppySlug - Puppy slug from URL
 * @returns Result with session URL or error
 */
export async function createCheckoutSession(
  puppySlug: string
): Promise<CreateCheckoutSessionResult> {
  try {
    // Step 1: Fetch puppy data
    const puppy = await getPuppyBySlug(puppySlug);

    if (!puppy) {
      return {
        success: false,
        error: 'Puppy not found',
        errorCode: 'PUPPY_NOT_FOUND',
      };
    }

    if (puppy.slug !== puppySlug) {
      throw new Error('Slug mismatch: outdated client data');
    }

    // Step 2: Validate puppy is available
    if (puppy.status !== 'available') {
      return {
        success: false,
        error: `This puppy is ${puppy.status} and cannot be reserved`,
        errorCode: 'PUPPY_NOT_AVAILABLE',
      };
    }

    // Step 3: Determine deposit amount (fixed $300 or use puppy price if lower)
    const DEPOSIT_AMOUNT_USD = 300;
    const depositAmount = puppy.price_usd
      ? Math.min(DEPOSIT_AMOUNT_USD, puppy.price_usd)
      : DEPOSIT_AMOUNT_USD;

    // Step 4: Get site URL for redirect URLs
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Step 5: Create Stripe Checkout Session
    const params: CreateCheckoutSessionParams = {
      puppyId: puppy.id,
      puppySlug: puppy.slug || '',
      puppyName: puppy.name || 'Bulldog Puppy',
      amountCents: depositAmount * 100, // Convert to cents
      customerEmail: '', // Will be collected in Checkout
      successUrl: `${siteUrl}/puppies/${puppySlug}/reserved?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/puppies/${puppySlug}`,
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: params.amountCents,
            product_data: {
              name: `Deposit for ${params.puppyName}`,
              description: `Reserve your ${params.puppyName} with a $${depositAmount} deposit`,
              images: puppy.photo_urls?.[0] ? [puppy.photo_urls[0]] : undefined,
            },
          },
          quantity: 1,
        },
      ],
      customer_creation: 'always', // Always create a Stripe customer
      phone_number_collection: {
        enabled: true, // Collect phone number
      },
      metadata: {
        puppy_id: params.puppyId,
        puppy_slug: params.puppySlug,
        puppy_name: params.puppyName,
        channel: 'site',
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      // Expire session after 24 hours (default)
      expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    });

    console.log(
      `[Checkout Session] Created session for puppy ${puppy.slug}: ${session.id}`
    );

    return {
      success: true,
      sessionUrl: session.url || undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Checkout Session] Error creating session: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
      errorCode: 'STRIPE_ERROR',
    };
  }
}
