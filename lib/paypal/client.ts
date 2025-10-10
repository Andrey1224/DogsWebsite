/**
 * PayPal Client Configuration
 *
 * Initializes PayPal REST API client for server-side order processing.
 * Uses client credentials flow for authentication.
 *
 * @see https://developer.paypal.com/docs/api/overview/
 */

// Validate required environment variables
const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
const paypalEnv = (process.env.PAYPAL_ENV || 'sandbox') as 'sandbox' | 'live';

if (!paypalClientId || !paypalClientSecret) {
  throw new Error(
    'Missing PayPal environment variables. ' +
    'Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your .env.local file.'
  );
}

/**
 * PayPal API base URL based on environment
 */
export const paypalBaseUrl =
  paypalEnv === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

/**
 * PayPal configuration object
 */
export const paypalConfig = {
  clientId: paypalClientId,
  clientSecret: paypalClientSecret,
  env: paypalEnv,
  baseUrl: paypalBaseUrl,
} as const;

/**
 * Get PayPal OAuth2 access token
 *
 * Uses client credentials grant type to obtain an access token
 * for making authenticated API requests.
 *
 * @returns Access token for API requests
 */
export async function getPayPalAccessToken(): Promise<string> {
  const auth = Buffer.from(
    `${paypalClientId}:${paypalClientSecret}`
  ).toString('base64');

  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal auth failed: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Webhook secret for signature verification
 */
export const paypalWebhookId = process.env.PAYPAL_WEBHOOK_ID || '';

if (!paypalWebhookId) {
  console.warn(
    'WARNING: PAYPAL_WEBHOOK_ID is not set. ' +
    'Webhook signature verification will be skipped.'
  );
}
