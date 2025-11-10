/**
 * Email notification for failed async payment
 *
 * Sent when a customer's bank transfer, voucher, or other async payment method fails
 * after they've completed the Stripe Checkout session.
 *
 * This helps retain customers by notifying them of the failure and offering alternatives.
 */

import { Resend } from 'resend';

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

interface AsyncPaymentFailedData {
  customerName?: string;
  customerEmail: string;
  puppyName: string;
  puppySlug: string;
}

/**
 * Generate customer email for failed async payment
 */
function generateAsyncPaymentFailedEmail(data: AsyncPaymentFailedData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const safePuppyName = escapeHtml(data.puppyName);
  const puppyUrl = `${siteUrl}/puppies/${data.puppySlug}`;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@exoticbulldoglegacy.com';
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Issue - Exotic Bulldog Legacy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ff9800; color: white; padding: 30px 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
        .section { margin-bottom: 20px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .puppy-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .retry-steps { background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .step { margin-bottom: 15px; }
        .step-number { display: inline-block; background: #4caf50; color: white; width: 30px; height: 30px; border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px; font-weight: bold; }
        .contact-box { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .btn { display: inline-block; padding: 12px 24px; margin-right: 10px; margin-bottom: 10px; border-radius: 5px; text-decoration: none; color: white; font-weight: bold; }
        .btn-retry { background: #4caf50; }
        .btn-contact { background: #2196f3; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Payment Could Not Be Processed</h1>
            <p>Your bank transfer or alternative payment method was unsuccessful</p>
        </div>

        <div class="warning-box">
            <strong>What happened?</strong>
            <p>We tried to process your payment for ${safePuppyName}, but unfortunately it was declined by your bank or payment provider. This is common with bank transfers and can often be resolved easily.</p>
        </div>

        <div class="puppy-info">
            <h2>Your Puppy</h2>
            <div class="field">
                <span class="label">Puppy:</span>
                <span class="value">${safePuppyName}</span>
            </div>
            <p style="margin-top: 15px;">
                <a href="${puppyUrl}" class="btn btn-retry">View Puppy Listing</a>
            </p>
        </div>

        <div class="retry-steps">
            <h2>What You Can Do</h2>

            <div class="step">
                <span class="step-number">1</span>
                <strong>Retry Payment (Recommended)</strong>
                <p>Go back to the puppy listing and try again with a different payment method (credit card, PayPal, etc.). Bank transfers sometimes take longer - you can retry later.</p>
                <p>
                    <a href="${puppyUrl}" class="btn btn-retry">Retry Payment</a>
                </p>
            </div>

            <div class="step">
                <span class="step-number">2</span>
                <strong>Contact Your Bank</strong>
                <p>If you see a charge on your account but it shows as failed, contact your bank's customer service. There may be a security issue or insufficient funds alert.</p>
            </div>

            <div class="step">
                <span class="step-number">3</span>
                <strong>Reach Out to Us</strong>
                <p>We're here to help! If you have any questions or need assistance, don't hesitate to contact us directly.</p>
            </div>
        </div>

        <div class="contact-box">
            <h2>Need Help?</h2>
            <p>We'd love to help you secure your puppy! Get in touch with our team:</p>
            <div class="field">
                <span class="label">Email:</span>
                <a href="mailto:${contactEmail}" style="color: #2196f3;">${contactEmail}</a>
            </div>
            ${contactPhone ? `
            <div class="field">
                <span class="label">Phone:</span>
                <a href="tel:${contactPhone}" style="color: #2196f3;">${contactPhone}</a>
            </div>
            ` : ''}
            <p style="margin-top: 15px;">
                <a href="mailto:${contactEmail}" class="btn btn-contact">Email Us</a>
            </p>
        </div>

        <div class="section">
            <h2>Troubleshooting Tips</h2>
            <ul>
                <li><strong>Bank Transfer Delays:</strong> Bank transfers can take 1-3 business days. You may need to retry on another day.</li>
                <li><strong>Insufficient Funds:</strong> Ensure you have enough funds in your account.</li>
                <li><strong>Daily Limits:</strong> Your bank may have daily transfer limits. Check with them to increase this.</li>
                <li><strong>International Transfers:</strong> International payments may require additional verification.</li>
            </ul>
        </div>

        <div class="footer">
            <p><strong>Exotic Bulldog Legacy</strong></p>
            <p>We're excited to help you welcome your new family member 🐾</p>
            <p style="color: #999; font-size: 11px; margin-top: 10px;">
                This is an automated notification from your puppy reservation system.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Send async payment failed notification to customer
 */
export async function sendAsyncPaymentFailedEmail(data: AsyncPaymentFailedData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      '[Email] Resend API key not configured, skipping async payment failed notification'
    );
    return { success: false, error: 'Resend API key not configured' };
  }

  try {
    const { data: emailData, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@exoticbulldoglegacy.com',
      to: [data.customerEmail],
      subject: `⚠️ Payment Issue with ${data.puppyName} - We Can Help!`,
      html: generateAsyncPaymentFailedEmail(data),
    });

    if (error) {
      console.error('[Email] Failed to send async payment failed notification:', error);
      return { success: false, error };
    }

    console.log('[Email] ✅ Async payment failed notification sent successfully:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('[Email] Error sending async payment failed notification:', error);
    return { success: false, error };
  }
}

// Export for testing
export function resetResendClient() {
  resendClient = null;
}
