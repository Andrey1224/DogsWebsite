// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';
import type Stripe from 'stripe';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/analytics/server-events', () => ({
  trackDepositPaid: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/emails/deposit-notifications', () => ({
  sendOwnerDepositNotification: vi.fn().mockResolvedValue({ success: true }),
  sendCustomerDepositConfirmation: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/emails/async-payment-failed', () => ({
  sendAsyncPaymentFailedEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/monitoring/webhook-alerts', () => ({
  alertWebhookError: vi.fn().mockResolvedValue(undefined),
  trackWebhookSuccess: vi.fn().mockResolvedValue(undefined),
}));

const BASE_ENV = { ...process.env };
const TEST_ENV = {
  supabaseUrl: process.env.SUPABASE_TEST_URL ?? process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_TEST_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey:
    process.env.SUPABASE_TEST_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE,
  supabaseDbUrl:
    process.env.SUPABASE_TEST_DB_URL ?? process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL,
  stripeSecretKey: process.env.STRIPE_TEST_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_TEST_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET,
};

function isLocalUrl(value?: string | null) {
  if (!value) return false;
  try {
    const { hostname } = new URL(value);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return value.includes('localhost') || value.includes('127.0.0.1');
  }
}

const hasRequiredEnv =
  Boolean(TEST_ENV.supabaseUrl) &&
  Boolean(TEST_ENV.supabaseAnonKey) &&
  Boolean(TEST_ENV.supabaseServiceKey) &&
  Boolean(TEST_ENV.supabaseDbUrl) &&
  Boolean(TEST_ENV.stripeSecretKey) &&
  Boolean(TEST_ENV.stripeWebhookSecret) &&
  isLocalUrl(TEST_ENV.supabaseUrl) &&
  isLocalUrl(TEST_ENV.supabaseDbUrl);

const describeOrSkip = hasRequiredEnv ? describe : describe.skip;

type TestCheckoutSessionBase = {
  id: string;
  object: 'checkout.session';
};

type TestCheckoutSessionCompletedEvent = {
  id: string;
  object: 'event';
  api_version: string;
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request: null;
  type: 'checkout.session.completed';
  data: {
    object: TestCheckoutSessionBase & {
      payment_status: 'paid';
      payment_intent: string;
      amount_total: number;
      currency: 'usd';
      customer_details: {
        email: string;
        name: string;
        phone: string;
      };
      metadata: {
        puppy_id: string;
        puppy_slug: string;
        puppy_name: string;
        customer_email: string;
        channel: string;
      };
    };
  };
};

type TestCheckoutSessionExpiredEvent = {
  id: string;
  object: 'event';
  api_version: string;
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request: null;
  type: 'checkout.session.expired';
  data: {
    object: TestCheckoutSessionBase;
  };
};

describeOrSkip('Stripe webhook integration (offline)', () => {
  let pool: Pool;
  let stripe: Stripe;
  let POST: (req: NextRequest) => Promise<Response>;

  beforeAll(async () => {
    Object.assign(process.env, BASE_ENV, {
      NODE_ENV: 'test',
      SUPABASE_URL: TEST_ENV.supabaseUrl,
      SUPABASE_ANON_KEY: TEST_ENV.supabaseAnonKey,
      SUPABASE_SERVICE_ROLE_KEY: TEST_ENV.supabaseServiceKey,
      SUPABASE_SERVICE_ROLE: TEST_ENV.supabaseServiceKey,
      STRIPE_SECRET_KEY: TEST_ENV.stripeSecretKey,
      STRIPE_WEBHOOK_SECRET: TEST_ENV.stripeWebhookSecret,
      RESEND_DELIVERY_MODE: 'never',
    });

    vi.resetModules();

    const stripeModule = await import('@/lib/stripe/client');
    stripe = stripeModule.stripe;
    ({ POST } = await import('@/app/api/stripe/webhook/route'));

    pool = new Pool({ connectionString: TEST_ENV.supabaseDbUrl });
  });

  beforeEach(async () => {
    await pool.query(
      'TRUNCATE TABLE webhook_events, reservations, puppies RESTART IDENTITY CASCADE;',
    );
  });

  afterAll(async () => {
    await pool.end();
    Object.assign(process.env, BASE_ENV);
  });

  async function insertPuppy() {
    const id = randomUUID();
    const slug = `test-puppy-${id.slice(0, 8)}`;
    const name = 'Test Puppy';
    const priceUsd = 900;

    await pool.query(
      `INSERT INTO puppies (id, name, slug, price_usd, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'available', NOW(), NOW())`,
      [id, name, slug, priceUsd],
    );

    return { id, slug, name };
  }

  function buildCheckoutCompletedEvent(params: {
    eventId: string;
    sessionId: string;
    paymentIntentId: string;
    puppyId: string;
    puppySlug: string;
    puppyName: string;
    amountTotal: number;
  }): TestCheckoutSessionCompletedEvent {
    return {
      id: params.eventId,
      object: 'event',
      api_version: '2025-10-29.clover',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 1,
      request: null,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: params.sessionId,
          object: 'checkout.session',
          payment_status: 'paid',
          payment_intent: params.paymentIntentId,
          amount_total: params.amountTotal,
          currency: 'usd',
          customer_details: {
            email: 'customer@example.com',
            name: 'Test Customer',
            phone: '+15555555555',
          },
          metadata: {
            puppy_id: params.puppyId,
            puppy_slug: params.puppySlug,
            puppy_name: params.puppyName,
            customer_email: 'customer@example.com',
            channel: 'site',
          },
        },
      },
    };
  }

  function buildExpiredEvent(params: {
    eventId: string;
    sessionId: string;
  }): TestCheckoutSessionExpiredEvent {
    return {
      id: params.eventId,
      object: 'event',
      api_version: '2025-10-29.clover',
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 1,
      request: null,
      type: 'checkout.session.expired',
      data: {
        object: {
          id: params.sessionId,
          object: 'checkout.session',
        },
      },
    };
  }

  function createSignedRequest(payload: string, secret: string) {
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });

    return new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json',
      },
      body: payload,
    });
  }

  it('creates reservation and webhook event for checkout.session.completed', async () => {
    const puppy = await insertPuppy();
    const event = buildCheckoutCompletedEvent({
      eventId: 'evt_int_1',
      sessionId: 'cs_test_int_1',
      paymentIntentId: 'pi_test_int_1',
      puppyId: puppy.id,
      puppySlug: puppy.slug,
      puppyName: puppy.name,
      amountTotal: 30000,
    });

    const payload = JSON.stringify(event);
    const request = createSignedRequest(payload, TEST_ENV.stripeWebhookSecret!);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(data.eventType).toBe('checkout.session.completed');

    const reservationRows = await pool.query(
      'SELECT * FROM reservations WHERE external_payment_id = $1',
      ['pi_test_int_1'],
    );
    expect(reservationRows.rowCount).toBe(1);
    expect(reservationRows.rows[0].payment_provider).toBe('stripe');
    expect(reservationRows.rows[0].status).toBe('pending');
    expect(reservationRows.rows[0].puppy_id).toBe(puppy.id);

    const webhookRows = await pool.query('SELECT * FROM webhook_events WHERE event_id = $1', [
      'evt_int_1',
    ]);
    expect(webhookRows.rowCount).toBe(1);
    expect(webhookRows.rows[0].event_type).toBe('checkout.session.completed');

    const puppyRows = await pool.query('SELECT status FROM puppies WHERE id = $1', [puppy.id]);
    expect(puppyRows.rows[0]?.status).toBe('reserved');
  });

  it('does not create duplicates for repeated event ids', async () => {
    const puppy = await insertPuppy();
    const event = buildCheckoutCompletedEvent({
      eventId: 'evt_int_2',
      sessionId: 'cs_test_int_2',
      paymentIntentId: 'pi_test_int_2',
      puppyId: puppy.id,
      puppySlug: puppy.slug,
      puppyName: puppy.name,
      amountTotal: 30000,
    });

    const payload = JSON.stringify(event);
    const firstResponse = await POST(createSignedRequest(payload, TEST_ENV.stripeWebhookSecret!));
    expect(firstResponse.status).toBe(200);

    const secondResponse = await POST(createSignedRequest(payload, TEST_ENV.stripeWebhookSecret!));
    const secondData = await secondResponse.json();
    expect(secondResponse.status).toBe(200);
    expect(secondData.duplicate).toBe(true);

    const reservationRows = await pool.query(
      'SELECT COUNT(*)::int AS count FROM reservations WHERE external_payment_id = $1',
      ['pi_test_int_2'],
    );
    expect(reservationRows.rows[0].count).toBe(1);

    const webhookRows = await pool.query(
      'SELECT COUNT(*)::int AS count FROM webhook_events WHERE event_id = $1',
      ['evt_int_2'],
    );
    expect(webhookRows.rows[0].count).toBe(1);
  });

  it('returns 400 for invalid signature without touching storage', async () => {
    const puppy = await insertPuppy();
    const event = buildCheckoutCompletedEvent({
      eventId: 'evt_int_3',
      sessionId: 'cs_test_int_3',
      paymentIntentId: 'pi_test_int_3',
      puppyId: puppy.id,
      puppySlug: puppy.slug,
      puppyName: puppy.name,
      amountTotal: 30000,
    });

    const payload = JSON.stringify(event);
    const request = createSignedRequest(payload, 'whsec_invalid');
    const response = await POST(request);

    expect(response.status).toBe(400);

    const reservationRows = await pool.query('SELECT COUNT(*)::int AS count FROM reservations');
    expect(reservationRows.rows[0].count).toBe(0);

    const webhookRows = await pool.query('SELECT COUNT(*)::int AS count FROM webhook_events');
    expect(webhookRows.rows[0].count).toBe(0);
  });

  it('stores checkout.session.expired events for audit', async () => {
    const event = buildExpiredEvent({
      eventId: 'evt_int_expired',
      sessionId: 'cs_test_expired',
    });

    const payload = JSON.stringify(event);
    const request = createSignedRequest(payload, TEST_ENV.stripeWebhookSecret!);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.eventType).toBe('checkout.session.expired');

    const webhookRows = await pool.query('SELECT * FROM webhook_events WHERE event_id = $1', [
      'evt_int_expired',
    ]);
    expect(webhookRows.rowCount).toBe(1);
    expect(webhookRows.rows[0].event_type).toBe('checkout.session.expired');
  });
});
