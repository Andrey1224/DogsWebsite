/**
 * Email notifications for deposit confirmations
 *
 * Sent when a customer successfully pays a deposit via Stripe or PayPal
 */

import { Resend } from "resend";
import type { PaymentProvider } from "@/lib/analytics/types";

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

interface DepositData {
  customerName: string;
  customerEmail: string;
  puppyName: string;
  puppySlug: string;
  depositAmount: number;
  currency: string;
  paymentProvider: PaymentProvider;
  reservationId: string;
  transactionId: string;
}

/**
 * Generate owner notification email for deposit payment
 */
function generateOwnerDepositEmail(data: DepositData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const safeName = escapeHtml(data.customerName);
  const safeEmail = escapeHtml(data.customerEmail);
  const safePuppyName = escapeHtml(data.puppyName);
  const puppyUrl = `${siteUrl}/puppies/${data.puppySlug}`;
  const providerLabel = data.paymentProvider === 'stripe' ? 'Stripe' : 'PayPal';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Deposit Received - Exotic Bulldog Level</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 20px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .amount { font-size: 24px; font-weight: bold; color: #28a745; }
        .puppy-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .actions { margin-top: 20px; }
        .btn { display: inline-block; padding: 10px 20px; margin-right: 10px; margin-bottom: 10px;
                border-radius: 5px; text-decoration: none; color: white; font-weight: bold; }
        .btn-email { background: #007bff; }
        .btn-view { background: #6c757d; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;
                 font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 New Deposit Received!</h1>
            <p>A customer has successfully paid a deposit</p>
        </div>

        <div class="section">
            <div class="amount">$${data.depositAmount.toFixed(2)} ${data.currency}</div>
            <p style="color: #666;">Payment via ${providerLabel}</p>
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
            <h2>Transaction Details</h2>
            <div class="field">
                <span class="label">Reservation ID:</span>
                <span class="value">#${data.reservationId}</span>
            </div>
            <div class="field">
                <span class="label">Transaction ID:</span>
                <span class="value">${data.transactionId}</span>
            </div>
            <div class="field">
                <span class="label">Payment Provider:</span>
                <span class="value">${providerLabel}</span>
            </div>
        </div>

        <div class="actions">
            <a href="mailto:${safeEmail}" class="btn btn-email">Reply to Customer</a>
        </div>

        <div class="footer">
            <p>This is an automated notification from Exotic Bulldog Level</p>
            <p>Transaction Date: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>
`;
}

/**
 * Generate customer confirmation email for deposit payment
 */
function generateCustomerDepositEmail(data: DepositData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const safeName = escapeHtml(data.customerName);
  const safePuppyName = escapeHtml(data.puppyName);
  const puppyUrl = `${siteUrl}/puppies/${data.puppySlug}`;
  const providerLabel = data.paymentProvider === 'stripe' ? 'Stripe' : 'PayPal';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@exoticbulldoglegacy.com';
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deposit Confirmation - Exotic Bulldog Level</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF4D79 0%, #FF7FA5 100%); color: white; padding: 30px 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .section { margin-bottom: 20px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .amount { font-size: 28px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
        .success-icon { font-size: 48px; text-align: center; margin-bottom: 10px; }
        .puppy-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .next-steps { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;
                 font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Deposit Confirmed!</h1>
            <p>Dear ${safeName}, thank you for reserving your puppy</p>
        </div>

        <div class="success-icon">✅</div>
        <div class="amount">$${data.depositAmount.toFixed(2)} ${data.currency}</div>
        <p style="text-align: center; color: #666;">Payment received via ${providerLabel}</p>

        <div class="puppy-info">
            <h2>Your Puppy</h2>
            <div class="field">
                <span class="label">Puppy:</span>
                <span class="value">${safePuppyName}</span>
            </div>
            <div class="field">
                <a href="${puppyUrl}" style="color: #007bff;">View Your Puppy</a>
            </div>
        </div>

        <div class="next-steps">
            <h2>What's Next?</h2>
            <ol>
                <li><strong>We'll Contact You Soon</strong> - Our team will reach out within 24 hours to discuss next steps</li>
                <li><strong>Health Records</strong> - We'll provide all health clearances and veterinary records</li>
                <li><strong>Pickup Arrangements</strong> - We'll coordinate the best time for you to meet your new puppy</li>
            </ol>
        </div>

        <div class="section">
            <h2>Transaction Details</h2>
            <div class="field">
                <span class="label">Reservation ID:</span>
                <span class="value">#${data.reservationId}</span>
            </div>
            <div class="field">
                <span class="label">Transaction ID:</span>
                <span class="value">${data.transactionId}</span>
            </div>
            <div class="field">
                <span class="label">Date:</span>
                <span class="value">${new Date().toLocaleString()}</span>
            </div>
        </div>

        <div class="section">
            <h2>Questions?</h2>
            <p>If you have any questions, please don't hesitate to contact us:</p>
            <div class="field">
                <span class="label">Email:</span>
                <a href="mailto:${contactEmail}" style="color: #007bff;">${contactEmail}</a>
            </div>
            ${contactPhone ? `
            <div class="field">
                <span class="label">Phone:</span>
                <a href="tel:${contactPhone}" style="color: #007bff;">${contactPhone}</a>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <p><strong>Thank you for choosing Exotic Bulldog Level!</strong></p>
            <p>We're excited to help you welcome your new family member 🐾</p>
        </div>
    </div>
</body>
</html>
`;
}

/**
 * Send deposit notification to owner
 */
export async function sendOwnerDepositNotification(data: DepositData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] Resend API key not configured, skipping owner deposit notification");
    return { success: false, error: "Resend API key not configured" };
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  if (!ownerEmail) {
    console.warn("[Email] Owner email not configured, skipping owner deposit notification");
    return { success: false, error: "Owner email not configured" };
  }

  try {
    const { data: emailData, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@exoticbulldoglegacy.com",
      to: [ownerEmail],
      subject: `💰 New Deposit: $${data.depositAmount} for ${data.puppyName}`,
      replyTo: data.customerEmail,
      html: generateOwnerDepositEmail(data),
    });

    if (error) {
      console.error("[Email] Failed to send owner deposit notification:", error);
      return { success: false, error };
    }

    console.log("[Email] ✅ Owner deposit notification sent successfully:", emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("[Email] Error sending owner deposit notification:", error);
    return { success: false, error };
  }
}

/**
 * Send deposit confirmation to customer
 */
export async function sendCustomerDepositConfirmation(data: DepositData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] Resend API key not configured, skipping customer deposit confirmation");
    return { success: false, error: "Resend API key not configured" };
  }

  try {
    const { data: emailData, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@exoticbulldoglegacy.com",
      to: [data.customerEmail],
      subject: `🎉 Deposit Confirmed - ${data.puppyName} is Reserved for You!`,
      html: generateCustomerDepositEmail(data),
    });

    if (error) {
      console.error("[Email] Failed to send customer deposit confirmation:", error);
      return { success: false, error };
    }

    console.log("[Email] ✅ Customer deposit confirmation sent successfully:", emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error("[Email] Error sending customer deposit confirmation:", error);
    return { success: false, error };
  }
}

// Export for testing
export function resetResendClient() {
  resendClient = null;
}
