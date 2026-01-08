/**
 * Email notifications for refund confirmations
 *
 * Sent when a deposit refund is processed via Stripe or PayPal
 */

import { Resend } from 'resend';
import type { PaymentProvider } from '@/lib/analytics/types';
import { getEmailDeliveryReason, shouldSendTransactionalEmails } from './delivery-control';

// Create a factory function for better testability
function createResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

let resendClient: ReturnType<typeof createResendClient> | null = null;

function getResendClient() {
  if (!resendClient) {
    resendClient = createResendClient();
  }
  return resendClient;
}

/**
 * Escape HTML special characters to prevent XSS attacks
 */
function escapeHtml(text: string | undefined): string {
  if (!text) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

export interface RefundData {
  customerName: string;
  customerEmail: string;
  puppyName: string;
  puppySlug: string;
  refundAmount: number;
  currency: string;
  paymentProvider: PaymentProvider;
  reservationId: string;
  refundId: string;
  reason?: string;
}

/**
 * Generate owner notification email for refund
 */
export function generateOwnerRefundEmail(data: RefundData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const safeName = escapeHtml(data.customerName);
  const safeEmail = escapeHtml(data.customerEmail);
  const safePuppyName = escapeHtml(data.puppyName);
  const safeReason = escapeHtml(data.reason);
  const puppyUrl = `${siteUrl}/puppies/${data.puppySlug}`;
  const providerLabel = data.paymentProvider === 'stripe' ? 'Stripe' : 'PayPal';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refund Processed - Exotic Bulldog Legacy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ffc107; color: #333; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .amount { font-size: 24px; font-weight: bold; color: #dc3545; }
        .puppy-info { background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .actions { margin-top: 20px; }
        .btn { display: inline-block; padding: 10px 20px; margin-right: 10px; margin-bottom: 10px;
                border-radius: 5px; text-decoration: none; color: white; font-weight: bold; }
        .btn-email { background: #007bff; }
        .btn-view { background: #6c757d; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;
                 font-size: 12px; color: #666; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💳 Refund Processed</h1>
            <p>A deposit has been refunded to a customer</p>
        </div>

        <div class="warning-box">
            <strong>⚠️ Action Required:</strong> The puppy is now available again and should be marked as such in the system.
        </div>

        <div class="section">
            <div class="amount">$${data.refundAmount.toFixed(2)} ${data.currency}</div>
            <p style="color: #666;">Refunded via ${providerLabel}</p>
        </div>

        <div class="puppy-info">
            <h2>Puppy Information</h2>
            <div class="field">
                <span class="label">Puppy:</span>
                <span class="value">${safePuppyName}</span>
            </div>
            <div class="field">
                <a href="${puppyUrl}" class="btn btn-view">View Puppy Listing</a>
            </div>
        </div>

        <div class="section">
            <h2>Customer Information</h2>
            <div class="field">
                <span class="label">Name:</span>
                <span class="value">${safeName}</span>
            </div>
            <div class="field">
                <span class="label">Email:</span>
                <a href="mailto:${safeEmail}" style="color: #007bff;">${safeEmail}</a>
            </div>
        </div>

        <div class="section">
            <h2>Refund Details</h2>
            <div class="field">
                <span class="label">Reservation ID:</span>
                <span class="value">#${data.reservationId}</span>
            </div>
            <div class="field">
                <span class="label">Refund ID:</span>
                <span class="value">${data.refundId}</span>
            </div>
            <div class="field">
                <span class="label">Payment Provider:</span>
                <span class="value">${providerLabel}</span>
            </div>
            ${
              safeReason
                ? `
            <div class="field">
                <span class="label">Reason:</span>
                <span class="value">${safeReason}</span>
            </div>
            `
                : ''
            }
        </div>

        <div class="actions">
            <a href="mailto:${safeEmail}" class="btn btn-email">Contact Customer</a>
        </div>

        <div class="footer">
            <p>This is an automated notification from Exotic Bulldog Legacy</p>
            <p>Refund Date: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
`;
}

/**
 * Generate customer notification email for refund
 */
export function generateCustomerRefundEmail(data: RefundData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const safeName = escapeHtml(data.customerName);
  const safePuppyName = escapeHtml(data.puppyName);
  const safeReason = escapeHtml(data.reason);
  const puppyUrl = `${siteUrl}/puppies/${data.puppySlug}`;
  const providerLabel = data.paymentProvider === 'stripe' ? 'Stripe' : 'PayPal';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@exoticbulldoglegacy.com';
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '';

  // Refund processing time varies by provider
  const processingTime =
    data.paymentProvider === 'stripe'
      ? '5-10 business days'
      : '5-10 business days (up to 30 days in some cases)';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refund Confirmation - Exotic Bulldog Legacy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6c757d 0%, #495057 100%); color: white; padding: 30px 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .section { margin-bottom: 20px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .amount { font-size: 28px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
        .info-icon { font-size: 48px; text-align: center; margin-bottom: 10px; }
        .puppy-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .timeline { background: #e7f3ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .info-box { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin-bottom: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;
                 font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💳 Refund Processed</h1>
            <p>Dear ${safeName}, your refund has been initiated</p>
        </div>

        <div class="info-icon">✅</div>
        <div class="amount">$${data.refundAmount.toFixed(2)} ${data.currency}</div>
        <p style="text-align: center; color: #666;">Refunded via ${providerLabel}</p>

        <div class="info-box">
            <strong>ℹ️ Processing Time:</strong> Your refund will appear in your account within ${processingTime}, depending on your bank or card issuer.
        </div>

        <div class="puppy-info">
            <h2>Reservation Details</h2>
            <div class="field">
                <span class="label">Puppy:</span>
                <span class="value">${safePuppyName}</span>
            </div>
            <div class="field">
                <a href="${puppyUrl}" style="color: #007bff;">View Puppy</a>
            </div>
            ${
              safeReason
                ? `
            <div class="field">
                <span class="label">Refund Reason:</span>
                <span class="value">${safeReason}</span>
            </div>
            `
                : ''
            }
        </div>

        <div class="timeline">
            <h2>What Happens Next?</h2>
            <ol>
                <li><strong>Refund Initiated</strong> - Your refund has been processed on our end</li>
                <li><strong>Bank Processing</strong> - Your bank or card issuer will process the refund (${processingTime})</li>
                <li><strong>Funds Available</strong> - You'll see the refund in your original payment method</li>
            </ol>
        </div>

        <div class="section">
            <h2>Transaction Details</h2>
            <div class="field">
                <span class="label">Reservation ID:</span>
                <span class="value">#${data.reservationId}</span>
            </div>
            <div class="field">
                <span class="label">Refund ID:</span>
                <span class="value">${data.refundId}</span>
            </div>
            <div class="field">
                <span class="label">Date:</span>
                <span class="value">${new Date().toLocaleString()}</span>
            </div>
            <div class="field">
                <span class="label">Original Payment Method:</span>
                <span class="value">${providerLabel}</span>
            </div>
        </div>

        <div class="section">
            <h2>Questions?</h2>
            <p>If you have any questions about your refund, please don't hesitate to contact us:</p>
            <div class="field">
                <span class="label">Email:</span>
                <a href="mailto:${contactEmail}" style="color: #007bff;">${contactEmail}</a>
            </div>
            ${
              contactPhone
                ? `
            <div class="field">
                <span class="label">Phone:</span>
                <a href="tel:${contactPhone}" style="color: #007bff;">${contactPhone}</a>
            </div>
            `
                : ''
            }
        </div>

        <div class="footer">
            <p><strong>Thank you for your interest in Exotic Bulldog Legacy</strong></p>
            <p>We hope to serve you again in the future 🐾</p>
        </div>
    </div>
</body>
</html>
`;
}

/**
 * Send refund notification to owner
 */
export async function sendOwnerRefundNotification(data: RefundData) {
  if (!shouldSendTransactionalEmails()) {
    console.info(
      `[Email] Skipping owner refund notification (delivery disabled: ${getEmailDeliveryReason()})`,
    );
    return { success: true, data: { skipped: true } };
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] Resend API key not configured, skipping owner refund notification');
    return { success: false, error: 'Resend API key not configured' };
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn('[Email] Owner email not configured, skipping owner refund notification');
    return { success: false, error: 'Owner email not configured' };
  }

  try {
    const { data: emailData, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@exoticbulldoglegacy.com',
      to: [ownerEmail],
      subject: `💳 Refund Processed: $${data.refundAmount} for ${data.puppyName}`,
      replyTo: data.customerEmail,
      html: generateOwnerRefundEmail(data),
    });

    if (error) {
      console.error('[Email] Failed to send owner refund notification:', error);
      return { success: false, error };
    }

    console.log('[Email] ✅ Owner refund notification sent successfully:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('[Email] Error sending owner refund notification:', error);
    return { success: false, error };
  }
}

/**
 * Send refund confirmation to customer
 */
export async function sendCustomerRefundNotification(data: RefundData) {
  if (!shouldSendTransactionalEmails()) {
    console.info(
      `[Email] Skipping customer refund notification (delivery disabled: ${getEmailDeliveryReason()})`,
    );
    return { success: true, data: { skipped: true } };
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] Resend API key not configured, skipping customer refund notification');
    return { success: false, error: 'Resend API key not configured' };
  }

  try {
    const { data: emailData, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@exoticbulldoglegacy.com',
      to: [data.customerEmail],
      subject: `💳 Refund Confirmation - ${data.puppyName}`,
      html: generateCustomerRefundEmail(data),
    });

    if (error) {
      console.error('[Email] Failed to send customer refund notification:', error);
      return { success: false, error };
    }

    console.log('[Email] ✅ Customer refund notification sent successfully:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('[Email] Error sending customer refund notification:', error);
    return { success: false, error };
  }
}

/**
 * Send both owner and customer refund notifications
 */
export async function sendRefundNotifications(data: RefundData) {
  const results = await Promise.allSettled([
    sendOwnerRefundNotification(data),
    sendCustomerRefundNotification(data),
  ]);

  const [ownerResult, customerResult] = results;

  return {
    owner:
      ownerResult.status === 'fulfilled'
        ? ownerResult.value
        : { success: false, error: ownerResult.reason },
    customer:
      customerResult.status === 'fulfilled'
        ? customerResult.value
        : { success: false, error: customerResult.reason },
  };
}

// Export for testing
export function resetResendClient() {
  resendClient = null;
}
