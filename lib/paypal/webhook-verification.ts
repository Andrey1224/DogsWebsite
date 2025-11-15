/**
 * PayPal webhook signature verification
 *
 * Uses PayPal's verify-webhook-signature API to validate incoming webhook
 * events before they are processed.
 */

import { getPayPalAccessToken, getPayPalApiBaseUrl } from './client';
import type {
  PayPalWebhookEvent,
  PayPalWebhookVerificationPayload,
  PayPalWebhookVerificationResponse,
} from './types';

export interface VerifyWebhookSignatureParams {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookId: string;
  webhookEvent: PayPalWebhookEvent<Record<string, unknown>>;
}

export async function verifyPayPalWebhookSignature(
  params: VerifyWebhookSignatureParams,
): Promise<boolean> {
  const accessToken = await getPayPalAccessToken();

  const payload: PayPalWebhookVerificationPayload = {
    auth_algo: params.authAlgo,
    cert_url: params.certUrl,
    transmission_id: params.transmissionId,
    transmission_sig: params.transmissionSig,
    transmission_time: params.transmissionTime,
    webhook_id: params.webhookId,
    webhook_event: params.webhookEvent,
  };

  const response = await fetch(
    `${getPayPalApiBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to verify PayPal webhook signature (${response.status} ${response.statusText}): ${errorBody}`,
    );
  }

  const data = (await response.json()) as PayPalWebhookVerificationResponse;
  return data.verification_status === 'SUCCESS';
}
