/**
 * Analytics event types for GA4 and Meta Pixel tracking
 */

export type PaymentProvider = 'stripe' | 'paypal';

export type DepositPaidEventParams = {
  value: number;
  currency: string;
  puppy_slug: string;
  puppy_name: string;
  payment_provider: PaymentProvider;
  reservation_id: string;
};

export type AnalyticsEvent =
  | { name: 'contact_click'; params: { channel: string } }
  | { name: 'form_submit'; params?: Record<string, unknown> }
  | { name: 'form_success'; params?: Record<string, unknown> }
  | { name: 'chat_open'; params?: Record<string, unknown> }
  | { name: 'reserve_click'; params: { puppy_slug: string } }
  | { name: 'deposit_paid'; params: DepositPaidEventParams };
