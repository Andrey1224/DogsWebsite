/**
 * Stripe Webhook API Route Tests
 *
 * Tests the POST /api/stripe/webhook endpoint that processes Stripe webhook
 * events with signature verification. Ensures proper handling of checkout
 * session events and error scenarios.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { POST, GET } from './route';

// Mock Stripe client and webhook handler
vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
  webhookSecret: 'whsec_test_secret',
}));

vi.mock('@/lib/stripe/webhook-handler', () => ({
  StripeWebhookHandler: {
    processEvent: vi.fn(),
  },
}));

vi.mock('@/lib/monitoring/webhook-alerts', () => ({
  alertWebhookError: vi.fn().mockResolvedValue(undefined),
  trackWebhookSuccess: vi.fn().mockResolvedValue(undefined),
}));

describe('POST /api/stripe/webhook', () => {
  const mockEventId = 'evt_test_123';
  const mockEventType = 'checkout.session.completed';
  const mockSessionId = 'cs_test_123';
  const mockPuppyId = '923e4567-e89b-12d3-a456-426614174000';

  const mockEvent = {
    id: mockEventId,
    type: mockEventType,
    data: {
      object: {
        id: mockSessionId,
        metadata: {
          puppy_id: mockPuppyId,
          puppy_slug: 'test-puppy',
        },
        customer_details: {
          email: 'customer@example.com',
        },
      },
    },
  };

  const createRequest = (body: string, signature: string | null = 'sig_test_123'): NextRequest => {
    const headers: Record<string, string> = {};
    if (signature !== null) {
      headers['stripe-signature'] = signature;
    }

    return new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body,
      headers,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processes valid Stripe webhook successfully', async () => {
    const { stripe } = await import('@/lib/stripe/client');
    const { StripeWebhookHandler } = await import('@/lib/stripe/webhook-handler');
    const { trackWebhookSuccess } = await import('@/lib/monitoring/webhook-alerts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (StripeWebhookHandler.processEvent as any).mockResolvedValue({
      success: true,
      eventType: mockEventType,
      reservationId: 'res_123',
    });

    const request = createRequest(JSON.stringify(mockEvent));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      received: true,
      eventType: mockEventType,
      duplicate: false,
      reservationId: 'res_123',
    });

    expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith(
      JSON.stringify(mockEvent),
      'sig_test_123',
      'whsec_test_secret',
    );

    expect(trackWebhookSuccess).toHaveBeenCalledWith('stripe', mockEventType);
  });

  it('returns 400 when Stripe-Signature header is missing', async () => {
    const request = createRequest(JSON.stringify(mockEvent), null);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Missing Stripe-Signature header' });
  });

  it('returns 400 when signature verification fails', async () => {
    const { stripe } = await import('@/lib/stripe/client');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.webhooks.constructEvent as any).mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature for payload');
    });

    const request = createRequest(JSON.stringify(mockEvent));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Webhook signature verification failed');
  });

  it('handles duplicate events successfully', async () => {
    const { stripe } = await import('@/lib/stripe/client');
    const { StripeWebhookHandler } = await import('@/lib/stripe/webhook-handler');
    const { trackWebhookSuccess } = await import('@/lib/monitoring/webhook-alerts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (StripeWebhookHandler.processEvent as any).mockResolvedValue({
      success: true,
      duplicate: true,
      eventType: mockEventType,
    });

    const request = createRequest(JSON.stringify(mockEvent));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      received: true,
      eventType: mockEventType,
      duplicate: true,
      reservationId: null,
    });

    expect(trackWebhookSuccess).toHaveBeenCalledWith('stripe', mockEventType);
  });

  it('returns 500 and sends alert when processing fails', async () => {
    const { stripe } = await import('@/lib/stripe/client');
    const { StripeWebhookHandler } = await import('@/lib/stripe/webhook-handler');
    const { alertWebhookError } = await import('@/lib/monitoring/webhook-alerts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (StripeWebhookHandler.processEvent as any).mockResolvedValue({
      success: false,
      error: 'Failed to create reservation',
      eventType: mockEventType,
    });

    const request = createRequest(JSON.stringify(mockEvent));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to create reservation',
      eventType: mockEventType,
    });

    expect(alertWebhookError).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'stripe',
        eventType: mockEventType,
        eventId: mockEventId,
        error: 'Failed to create reservation',
        puppyId: mockPuppyId,
        customerEmail: 'customer@example.com',
      }),
    );
  });

  it('handles unexpected errors and sends alert', async () => {
    const { stripe } = await import('@/lib/stripe/client');
    const { alertWebhookError } = await import('@/lib/monitoring/webhook-alerts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.webhooks.constructEvent as any).mockImplementation(() => {
      throw new Error('Unexpected Stripe error');
    });

    const request = createRequest(JSON.stringify(mockEvent));
    await POST(request);

    expect(alertWebhookError).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'stripe',
        eventType: 'unknown',
        eventId: 'unknown',
        error: expect.stringContaining('Unexpected error'),
      }),
    );
  });

  it('continues processing even if alert fails', async () => {
    const { stripe } = await import('@/lib/stripe/client');
    const { StripeWebhookHandler } = await import('@/lib/stripe/webhook-handler');
    const { trackWebhookSuccess } = await import('@/lib/monitoring/webhook-alerts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.webhooks.constructEvent as any).mockReturnValue(mockEvent);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (StripeWebhookHandler.processEvent as any).mockResolvedValue({
      success: true,
      eventType: mockEventType,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trackWebhookSuccess as any).mockRejectedValue(new Error('Alert service down'));

    const request = createRequest(JSON.stringify(mockEvent));
    const response = await POST(request);

    // Should still return success even if alerting fails
    expect(response.status).toBe(200);
  });

  it('handles events without customer_details gracefully', async () => {
    const { stripe } = await import('@/lib/stripe/client');
    const { StripeWebhookHandler } = await import('@/lib/stripe/webhook-handler');

    const eventWithoutCustomer = {
      ...mockEvent,
      data: {
        object: {
          id: mockSessionId,
          metadata: {
            puppy_id: mockPuppyId,
            customer_email: 'metadata@example.com',
          },
        },
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.webhooks.constructEvent as any).mockReturnValue(eventWithoutCustomer);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (StripeWebhookHandler.processEvent as any).mockResolvedValue({
      success: false,
      error: 'Test error',
      eventType: mockEventType,
    });

    const { alertWebhookError } = await import('@/lib/monitoring/webhook-alerts');

    const request = createRequest(JSON.stringify(eventWithoutCustomer));
    await POST(request);

    expect(alertWebhookError).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: 'metadata@example.com',
      }),
    );
  });
});

describe('GET /api/stripe/webhook', () => {
  it('returns webhook configuration info', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      status: 'Stripe webhook endpoint active',
      runtime: 'nodejs',
      webhookSecretConfigured: true,
      supportedEvents: [
        'checkout.session.completed',
        'checkout.session.async_payment_succeeded',
        'checkout.session.async_payment_failed',
        'checkout.session.expired',
      ],
    });
  });

  it('indicates when webhook secret is not configured', async () => {
    // Temporarily mock webhookSecret as undefined
    vi.doMock('@/lib/stripe/client', () => ({
      stripe: {
        webhooks: {
          constructEvent: vi.fn(),
        },
      },
      webhookSecret: undefined,
    }));

    // Need to re-import the route to get the mocked value
    const { GET: getMocked } = await import('./route?t=' + Date.now());
    const response = await getMocked();
    const data = await response.json();

    expect(data.webhookSecretConfigured).toBe(false);
  });
});
