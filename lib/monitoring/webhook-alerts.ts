/**
 * Webhook Error Monitoring & Alerting
 *
 * Sends notifications when webhook processing fails to help with
 * quick incident response.
 *
 * Supports:
 * - Email notifications via Resend
 * - Slack notifications via webhook (optional)
 * - Error rate tracking
 * - Automatic throttling to prevent alert spam
 */

import { Resend } from 'resend';
import {
  getEmailDeliveryReason,
  shouldSendTransactionalEmails,
} from '@/lib/emails/delivery-control';

// Alert configuration
const ALERT_CONFIG = {
  // Minimum time between alerts (in minutes) to prevent spam
  THROTTLE_MINUTES: 15,
  // Email recipients for critical alerts
  // Slack webhook URL (optional)
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
};

function getAlertEmails(): string[] {
  const configured = (process.env.ALERT_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
  const fallback = process.env.OWNER_EMAIL?.trim();
  return configured.length > 0 ? configured : fallback ? [fallback] : [];
}

// In-memory throttle tracking (resets on deployment)
const lastAlertTime = new Map<string, number>();
const globalAlertTimes: number[] = [];
let suppressedAlertCount = 0;
const GLOBAL_ALERTS_PER_MINUTE = 10;

export interface WebhookErrorContext {
  provider: 'stripe' | 'paypal';
  eventType: string;
  eventId: string;
  paymentId?: string;
  error: string;
  puppyId?: string;
  customerEmail?: string;
  timestamp: Date;
}

/**
 * Send alert for webhook processing error
 */
export async function alertWebhookError(context: WebhookErrorContext): Promise<void> {
  // Check throttle
  const throttleKey = `${context.provider}:${context.paymentId || context.eventId}`;
  const now = Date.now();
  const lastAlert = lastAlertTime.get(throttleKey);

  if (lastAlert && now - lastAlert < ALERT_CONFIG.THROTTLE_MINUTES * 60 * 1000) {
    console.log(
      `[Webhook Alert] Throttled: ${throttleKey} (last alert ${Math.round((now - lastAlert) / 60000)}m ago)`,
    );
    return;
  }

  while (globalAlertTimes.length > 0 && now - globalAlertTimes[0] > 60_000) {
    globalAlertTimes.shift();
  }
  if (globalAlertTimes.length >= GLOBAL_ALERTS_PER_MINUTE) {
    suppressedAlertCount += 1;
    console.warn(
      `[Webhook Alert] Global rate cap reached; ${suppressedAlertCount} alert(s) suppressed`,
    );
    return;
  }

  globalAlertTimes.push(now);

  // Update throttle timestamp
  lastAlertTime.set(throttleKey, now);

  // Send notifications in parallel
  const notifications = [];

  const alertEmails = getAlertEmails();
  if (alertEmails.length === 0 && !ALERT_CONFIG.SLACK_WEBHOOK_URL) {
    throw new Error('Webhook alerts are misconfigured: set ALERT_EMAILS or OWNER_EMAIL');
  }
  if (process.env.RESEND_API_KEY && alertEmails.length > 0 && shouldSendTransactionalEmails()) {
    notifications.push(sendEmailAlert(context, alertEmails, suppressedAlertCount));
    suppressedAlertCount = 0;
  } else if (!shouldSendTransactionalEmails()) {
    console.info(
      `[Webhook Alert] Skipping email alert (delivery disabled: ${getEmailDeliveryReason()})`,
    );
  }

  if (ALERT_CONFIG.SLACK_WEBHOOK_URL) {
    notifications.push(sendSlackAlert(context));
  }

  // Wait for all notifications to complete
  const results = await Promise.allSettled(notifications);

  // Log results
  results.forEach((result, index) => {
    const channel = index === 0 ? 'email' : 'slack';
    if (result.status === 'fulfilled') {
      console.log(`[Webhook Alert] ✅ ${channel} alert sent for ${throttleKey}`);
    } else {
      console.error(`[Webhook Alert] ❌ Failed to send ${channel} alert:`, result.reason);
    }
  });
}

/**
 * Send email alert for webhook error
 */
async function sendEmailAlert(
  context: WebhookErrorContext,
  recipients: string[],
  suppressedCount: number,
): Promise<void> {
  if (!shouldSendTransactionalEmails()) {
    console.info(
      `[Webhook Alert] Skipping email alert (delivery disabled: ${getEmailDeliveryReason()})`,
    );
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const subject = `🚨 Webhook Error: ${context.provider.toUpperCase()} - ${context.eventType}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Webhook Error Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .error-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .details { background: #f9fafb; padding: 15px; border-radius: 8px; }
        .field { margin-bottom: 10px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; font-family: monospace; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 Webhook Processing Error</h1>
            <p>A webhook event failed to process successfully</p>
        </div>

        <div class="error-box">
            <strong>Error:</strong> ${escapeHtml(context.error)}
            ${suppressedCount > 0 ? `<p>${suppressedCount} additional alert(s) were rate-limited.</p>` : ''}
        </div>

        <div class="details">
            <h2>Event Details</h2>
            <div class="field">
                <span class="label">Provider:</span>
                <span class="value">${context.provider.toUpperCase()}</span>
            </div>
            <div class="field">
                <span class="label">Event Type:</span>
                <span class="value">${context.eventType}</span>
            </div>
            <div class="field">
                <span class="label">Event ID:</span>
                <span class="value">${context.eventId}</span>
            </div>
            <div class="field">
                <span class="label">Timestamp:</span>
                <span class="value">${context.timestamp.toISOString()}</span>
            </div>
            ${
              context.puppyId
                ? `
            <div class="field">
                <span class="label">Puppy ID:</span>
                <span class="value">${context.puppyId}</span>
            </div>
            `
                : ''
            }
            ${
              context.customerEmail
                ? `
            <div class="field">
                <span class="label">Customer Email:</span>
                <span class="value">${escapeHtml(context.customerEmail)}</span>
            </div>
            `
                : ''
            }
        </div>

        <div class="details" style="margin-top: 20px;">
            <h2>Next Steps</h2>
            <ol>
                <li>Check the <a href="${process.env.NEXT_PUBLIC_SITE_URL}/api/health/webhooks">webhook health endpoint</a> for more details</li>
                <li>Review webhook event logs in Supabase database</li>
                <li>Verify ${context.provider.toUpperCase()} webhook configuration</li>
                <li>Check for any service outages or API changes</li>
                <li>If customer payment was affected, contact customer: ${context.customerEmail || 'N/A'}</li>
            </ol>
        </div>

        <div class="footer">
            <p><strong>Exotic Bulldog Legacy - Automated Webhook Monitoring</strong></p>
            <p>This is an automated alert from your payment webhook monitoring system.</p>
        </div>
    </div>
</body>
</html>
  `;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'alerts@exoticbulldoglegacy.com',
    to: recipients,
    subject,
    html,
  });
}

/**
 * Send Slack alert for webhook error
 */
async function sendSlackAlert(context: WebhookErrorContext): Promise<void> {
  if (!ALERT_CONFIG.SLACK_WEBHOOK_URL) {
    return;
  }

  const payload = {
    text: `🚨 Webhook Error: ${context.provider.toUpperCase()} - ${context.eventType}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 Webhook Processing Error`,
          emoji: true,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Provider:*\n${context.provider.toUpperCase()}`,
          },
          {
            type: 'mrkdwn',
            text: `*Event Type:*\n${context.eventType}`,
          },
          {
            type: 'mrkdwn',
            text: `*Event ID:*\n\`${context.eventId}\``,
          },
          {
            type: 'mrkdwn',
            text: `*Timestamp:*\n${context.timestamp.toISOString()}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Error:*\n\`\`\`${context.error}\`\`\``,
        },
      },
      ...(context.customerEmail
        ? [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Customer Email:* ${context.customerEmail}`,
              },
            },
          ]
        : []),
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Health Check',
              emoji: true,
            },
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/health/webhooks`,
          },
        ],
      },
    ],
  };

  const response = await fetch(ALERT_CONFIG.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.status} ${response.statusText}`);
  }
}

/**
 * Escape HTML to prevent XSS in email templates
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Track webhook success for monitoring
 * Can be used to calculate error rates over time
 */
export async function trackWebhookSuccess(
  provider: 'stripe' | 'paypal',
  eventType: string,
): Promise<void> {
  // Future: Store success metrics in database or external monitoring service
  // For now, just log for observability
  console.log(`[Webhook Success] ${provider}:${eventType}`);
}
