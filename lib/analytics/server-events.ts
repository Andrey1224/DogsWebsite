/**
 * Server-side analytics event tracking via GA4 Measurement Protocol
 *
 * Used for tracking events that happen server-side (e.g., webhook handlers)
 * where client-side tracking is not available.
 */

import type { DepositPaidEventParams } from './types';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_API_SECRET = process.env.GA4_API_SECRET;
const MEASUREMENT_PROTOCOL_URL = 'https://www.google-analytics.com/mp/collect';

/**
 * Sends a deposit_paid event to GA4 Measurement Protocol
 *
 * @param params - Event parameters including value, currency, puppy info, etc.
 * @param clientId - GA4 client ID (optional, will generate if not provided)
 */
export async function trackDepositPaid(
  params: DepositPaidEventParams,
  clientId?: string,
): Promise<void> {
  // Skip in development or if GA is not configured
  if (process.env.NODE_ENV === 'development' || !GA_MEASUREMENT_ID || !GA_API_SECRET) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [DEV] Server Analytics: deposit_paid', params);
    }
    return;
  }

  try {
    const payload = {
      client_id: clientId || generateClientId(),
      events: [
        {
          name: 'deposit_paid',
          params: {
            value: params.value,
            currency: params.currency,
            puppy_slug: params.puppy_slug,
            puppy_name: params.puppy_name,
            payment_provider: params.payment_provider,
            reservation_id: params.reservation_id,
          },
        },
      ],
    };

    const url = `${MEASUREMENT_PROTOCOL_URL}?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to send GA4 event:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error sending GA4 event:', error);
  }
}

/**
 * Generates a pseudo-random client ID for GA4
 * Format: {timestamp}.{random}
 */
function generateClientId(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.floor(Math.random() * 1e9);
  return `${timestamp}.${random}`;
}
