/**
 * PayPal API Client
 *
 * Lightweight helper for interacting with PayPal's REST API without pulling
 * in the full server SDK. Provides access token management, order creation,
 * order capture, and generic request handling.
 */

import crypto from "node:crypto";

import type {
  PayPalCaptureResponse,
  PayPalCreateOrderResponse,
  PayPalEnvironment,
  PayPalOrderMetadata,
} from "./types";

const PAYPAL_API_BASE: Record<PayPalEnvironment, string> = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
};

interface AccessTokenCache {
  token: string;
  expiresAt: number;
}

let accessTokenCache: AccessTokenCache | null = null;

function getClientConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const env = (process.env.PAYPAL_ENV || "sandbox").toLowerCase() as PayPalEnvironment;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal client credentials are not configured");
  }

  if (env !== "sandbox" && env !== "live") {
    throw new Error(`Invalid PAYPAL_ENV value: ${process.env.PAYPAL_ENV}`);
  }

  return { clientId, clientSecret, env };
}

export function getPayPalEnvironment(): PayPalEnvironment {
  const { env } = getClientConfig();
  return env;
}

export function getPayPalApiBaseUrl(): string {
  const env = getPayPalEnvironment();
  return PAYPAL_API_BASE[env];
}

async function requestAccessToken(forceRefresh = false): Promise<string> {
  if (!forceRefresh && accessTokenCache && Date.now() < accessTokenCache.expiresAt) {
    return accessTokenCache.token;
  }

  const { clientId, clientSecret } = getClientConfig();
  const url = `${getPayPalApiBaseUrl()}/v1/oauth2/token`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to obtain PayPal access token (${response.status} ${response.statusText}): ${errorBody}`,
    );
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };

  accessTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // refresh one minute early
  };

  return data.access_token;
}

export async function getPayPalAccessToken(forceRefresh = false): Promise<string> {
  return requestAccessToken(forceRefresh);
}

async function paypalFetch<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: Record<string, unknown> | string;
    requestId?: string;
  } = {},
): Promise<T> {
  const accessToken = await requestAccessToken();
  const url = `${getPayPalApiBaseUrl()}${path}`;
  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  });

  if (options.requestId) {
    headers.set("PayPal-Request-Id", options.requestId);
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: typeof options.body === "string" ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    // Attempt to parse error structure from PayPal
    const errorText = await response.text();
    throw new Error(
      `PayPal API request failed (${response.status} ${response.statusText}): ${errorText}`,
    );
  }

  return (await response.json()) as T;
}

export interface CreatePayPalOrderOptions {
  amount: number;
  description: string;
  metadata: PayPalOrderMetadata;
  requestId?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

function buildCustomId(metadata: PayPalOrderMetadata, amount: number): string {
  const compactMetadata: Record<string, string | number> = {
    id: metadata.puppy_id,
    slug: metadata.puppy_slug,
    name: metadata.puppy_name,
    channel: metadata.channel ?? "",
    email: metadata.customer_email ?? "",
    customer: metadata.customer_name ?? "",
    phone: metadata.customer_phone ?? "",
    amt: metadata.deposit_amount ?? amount,
  };

  // Remove empty values to keep the payload minimal
  for (const key of Object.keys(compactMetadata)) {
    const value = compactMetadata[key];
    if (value === "" || value === undefined) {
      delete compactMetadata[key];
    }
  }

  const metadataString = JSON.stringify(compactMetadata);

  if (metadataString.length > 127) {
    throw new Error("PayPal custom_id exceeds 127 character limit");
  }

  return metadataString;
}

export async function createPayPalOrder(
  options: CreatePayPalOrderOptions,
): Promise<PayPalCreateOrderResponse> {
  const { amount, description, metadata, requestId, returnUrl, cancelUrl } = options;

  const amountValue = amount.toFixed(2);
  const metadataString = buildCustomId(metadata, amount);

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amountValue,
        },
        description,
        custom_id: metadataString,
      },
    ],
    application_context: {
      user_action: "PAY_NOW",
      shipping_preference: "NO_SHIPPING",
      brand_name: "Exotic Bulldog Legacy",
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  };

  return paypalFetch<PayPalCreateOrderResponse>("/v2/checkout/orders", {
    method: "POST",
    body,
    requestId: requestId ?? crypto.randomUUID(),
  });
}

export interface CapturePayPalOrderOptions {
  orderId: string;
  requestId?: string;
}

export async function capturePayPalOrder(
  options: CapturePayPalOrderOptions,
): Promise<PayPalCaptureResponse> {
  const { orderId, requestId } = options;

  return paypalFetch<PayPalCaptureResponse>(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    body: "{}",
    requestId: requestId ?? crypto.randomUUID(),
  });
}

export async function getPayPalOrder(
  orderId: string,
): Promise<PayPalCreateOrderResponse> {
  return paypalFetch<PayPalCreateOrderResponse>(`/v2/checkout/orders/${orderId}`);
}

export function clearPayPalAccessTokenCache() {
  accessTokenCache = null;
}
