/**
 * PayPal Type Definitions
 *
 * Minimal type surface tailored to our PayPal integration so we can work
 * with strongly typed payloads without pulling in the entire SDK typings.
 */

import type { ReservationCreationErrorCode } from '@/lib/reservations/types';

export type PayPalEnvironment = "sandbox" | "live";

export interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

export interface PayPalAmount {
  currency_code: string;
  value: string;
}

export interface PayPalPurchaseUnit {
  reference_id?: string;
  description?: string;
  custom_id?: string;
  amount?: PayPalAmount;
  payments?: {
    captures?: PayPalCapture[];
  };
}

export interface PayPalPayerName {
  given_name?: string;
  surname?: string;
}

export interface PayPalPayer {
  email_address?: string;
  name?: PayPalPayerName;
  payer_id?: string;
  phone?: {
    phone_number?: {
      national_number?: string;
    };
  };
}

export interface PayPalCreateOrderResponse {
  id: string;
  status: string;
  intent?: string;
  links: PayPalLink[];
  purchase_units?: PayPalPurchaseUnit[];
  payer?: PayPalPayer;
}

export interface PayPalCapture {
  id: string;
  status: string;
  amount: PayPalAmount;
  custom_id?: string;
  seller_receivable_breakdown?: {
    gross_amount: PayPalAmount;
    paypal_fee?: PayPalAmount;
    net_amount?: PayPalAmount;
  };
  create_time?: string;
  update_time?: string;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  links: PayPalLink[];
  purchase_units?: PayPalPurchaseUnit[];
  payer?: PayPalPayer;
}

export interface PayPalWebhookEvent<T = unknown> {
  id: string;
  event_version?: string;
  create_time?: string;
  resource_type: string;
  event_type: string;
  summary?: string;
  resource: T;
  transmission_id?: string;
  links?: PayPalLink[];
}

export interface PayPalWebhookVerificationPayload {
  auth_algo: string;
  cert_url: string;
  transmission_id: string;
  transmission_sig: string;
  transmission_time: string;
  webhook_id: string;
  webhook_event: PayPalWebhookEvent<Record<string, unknown>>;
}

export interface PayPalWebhookVerificationResponse {
  verification_status: "SUCCESS" | "FAILURE";
}

export interface PayPalOrderMetadata {
  puppy_id: string;
  puppy_slug: string;
  puppy_name: string;
  channel?: string;
  deposit_amount?: number;
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
}

export interface PayPalWebhookProcessingResult {
  success: boolean;
  eventType: string;
  captureId?: string;
  orderId?: string;
  duplicate?: boolean;
  error?: string;
  reservationId?: string;
  errorCode?: ReservationCreationErrorCode;
}
