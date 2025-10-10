/**
 * PayPal Type Definitions
 *
 * Custom types for PayPal Orders API v2 integration.
 * These types cover order creation, capture, and webhook handling.
 *
 * @see https://developer.paypal.com/docs/api/orders/v2/
 */

/**
 * PayPal order intent
 */
export type PayPalIntent = 'CAPTURE' | 'AUTHORIZE';

/**
 * PayPal order status
 */
export type PayPalOrderStatus =
  | 'CREATED'
  | 'SAVED'
  | 'APPROVED'
  | 'VOIDED'
  | 'COMPLETED'
  | 'PAYER_ACTION_REQUIRED';

/**
 * PayPal capture status
 */
export type PayPalCaptureStatus =
  | 'COMPLETED'
  | 'DECLINED'
  | 'PARTIALLY_REFUNDED'
  | 'PENDING'
  | 'REFUNDED'
  | 'FAILED';

/**
 * Money amount with currency
 */
export interface PayPalMoney {
  currency_code: string;
  value: string;
}

/**
 * Purchase unit for order creation
 */
export interface PayPalPurchaseUnit {
  reference_id?: string;
  description?: string;
  custom_id?: string;
  soft_descriptor?: string;
  amount: PayPalMoney;
  payee?: {
    email_address?: string;
    merchant_id?: string;
  };
}

/**
 * Application context for checkout flow
 */
export interface PayPalApplicationContext {
  brand_name?: string;
  locale?: string;
  landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE';
  shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
  user_action?: 'CONTINUE' | 'PAY_NOW';
  return_url?: string;
  cancel_url?: string;
}

/**
 * Order creation request
 */
export interface CreatePayPalOrderRequest {
  intent: PayPalIntent;
  purchase_units: PayPalPurchaseUnit[];
  application_context?: PayPalApplicationContext;
}

/**
 * PayPal order response
 */
export interface PayPalOrder {
  id: string;
  status: PayPalOrderStatus;
  intent: PayPalIntent;
  purchase_units: Array<{
    reference_id?: string;
    amount: PayPalMoney;
    payee?: {
      email_address?: string;
      merchant_id?: string;
    };
    payments?: {
      captures?: PayPalCapture[];
    };
  }>;
  payer?: {
    name?: {
      given_name?: string;
      surname?: string;
    };
    email_address?: string;
    payer_id?: string;
  };
  create_time?: string;
  update_time?: string;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

/**
 * PayPal capture details
 */
export interface PayPalCapture {
  id: string;
  status: PayPalCaptureStatus;
  amount: PayPalMoney;
  final_capture?: boolean;
  seller_protection?: {
    status: string;
    dispute_categories?: string[];
  };
  create_time?: string;
  update_time?: string;
}

/**
 * Parameters for creating a PayPal order
 */
export interface CreateOrderParams {
  /** Puppy ID for tracking */
  puppyId: string;
  /** Puppy slug for URL generation */
  puppySlug: string;
  /** Puppy name for description */
  puppyName: string;
  /** Deposit amount in USD (e.g., 300.00) */
  amountUsd: number;
  /** Customer email (optional) */
  customerEmail?: string;
}

/**
 * Result of order capture
 */
export interface CaptureOrderResult {
  /** Whether capture was successful */
  success: boolean;
  /** PayPal order ID */
  orderId: string;
  /** Capture ID */
  captureId?: string;
  /** Capture status */
  status?: PayPalCaptureStatus;
  /** Captured amount */
  amount?: PayPalMoney;
  /** Error message if capture failed */
  error?: string;
  /** Custom ID from purchase unit (contains puppy tracking data) */
  customId?: string;
}

/**
 * Supported PayPal webhook event types
 */
export type PayPalWebhookEvent =
  | 'CHECKOUT.ORDER.APPROVED'
  | 'PAYMENT.CAPTURE.COMPLETED'
  | 'PAYMENT.CAPTURE.DENIED'
  | 'PAYMENT.CAPTURE.REFUNDED';

/**
 * PayPal webhook event structure
 */
export interface PayPalWebhookPayload {
  id: string;
  event_type: PayPalWebhookEvent;
  create_time: string;
  resource_type: string;
  resource: PayPalOrder | PayPalCapture;
  summary?: string;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}
