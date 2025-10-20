/**
 * send_webhook.ts
 *
 * Local helper to send a Stripe-signed webhook payload to the dev server.
 *
 * Usage:
 *   export WEBHOOK_SECRET="whsec_..."   # your local Stripe webhook secret
 *   export WEBHOOK_URL="http://localhost:3000/api/stripe/webhook" # optional override
 *   npx tsx send_webhook.ts
 */

import { createHmac } from "crypto";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.error("ERROR: set WEBHOOK_SECRET env var (whsec_...)");
  process.exit(1);
}

const WEBHOOK_URL = process.env.WEBHOOK_URL ?? "http://localhost:3000/api/stripe/webhook";

const event = {
  id: `evt_test_async_failed_${Math.random().toString(36).slice(2, 9)}`,
  object: "event",
  api_version: "2025-09-30",
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: `cs_test_${Math.random().toString(36).slice(2, 10)}`,
      object: "checkout.session",
      payment_status: "unpaid",
      customer_email: "buyer.test@example.com",
      customer_details: {
        email: "buyer.test@example.com",
        name: "Buyer Test",
      },
      metadata: {
        puppy_id: "00000000-0000-0000-0000-000000000001",
        puppy_slug: "french-bulldog-milo",
        puppy_name: "French Bulldog Milo",
        customer_email: "",
        channel: "site",
      },
    },
  },
  livemode: false,
  pending_webhooks: 1,
  request: { id: null, idempotency_key: null },
  type: "checkout.session.async_payment_failed",
};

const payload = JSON.stringify(event);

function computeStripeSignature(secret: string, body: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${body}`;
  const hmac = createHmac("sha256", secret).update(signedPayload, "utf8").digest("hex");
  return `t=${timestamp},v1=${hmac}`;
}

async function sendWebhook() {
  try {
    const signature = computeStripeSignature(WEBHOOK_SECRET, payload);
    console.log("Sending webhook to", WEBHOOK_URL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": signature,
        "User-Agent": "Stripe-CLI/Local-Test",
      },
      body: payload,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await response.text();
    let data: unknown = text;

    try {
      data = JSON.parse(text);
    } catch {
      // response is not JSON-shaped, keep text payload
    }

    console.log("Received status", response.status, data);
  } catch (error) {
    console.error("Request error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void sendWebhook();
