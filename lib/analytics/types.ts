/**
 * Analytics event types for GA4 and Meta Pixel tracking
 */

export type PaymentProvider = 'stripe' | 'paypal';

export type AnalyticsIdentifiers = {
  clientId?: string;
  sessionId?: string;
};

export type DepositPaidEventParams = {
  value: number;
  currency: string;
  puppy_slug: string;
  puppy_name: string;
  payment_provider: PaymentProvider;
  reservation_id: string;
};

export type CommerceEventParams = {
  currency: string;
  value?: number;
  items: Array<{
    item_id: string;
    item_name: string;
    item_category?: string;
    price?: number;
    quantity: number;
  }>;
};

export type AnalyticsEvent =
  | { name: 'contact_click'; params: { channel: string } }
  | { name: 'form_submit'; params?: Record<string, unknown> }
  | { name: 'form_success'; params?: Record<string, unknown> }
  | { name: 'generate_lead'; params?: Record<string, unknown> }
  | { name: 'chat_open'; params?: Record<string, unknown> }
  | { name: 'reserve_click'; params: { puppy_slug: string } }
  | { name: 'view_item'; params: CommerceEventParams }
  | { name: 'begin_checkout'; params: CommerceEventParams }
  | { name: 'checkout_error'; params?: Record<string, unknown> }
  | { name: 'deposit_paid'; params: DepositPaidEventParams };
