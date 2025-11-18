/**
 * PayPal Webhook API Route Tests
 *
 * Tests the POST /api/paypal/webhook endpoint that processes PayPal webhook
 * events. Validates webhook signatures, handles different event types, and
 * ensures proper error handling and alerting.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from './route';

vi.mock('@/lib/paypal/webhook-handler', () => ({
  PayPalWebhookHandler: {
    processEvent: vi.fn(),
  },
}));

vi.mock('@/lib/paypal/webhook-verification', () => ({
  verifyPayPalWebhookSignature: vi.fn(),
}));

vi.mock('@/lib/monitoring/webhook-alerts', () => ({
  alertWebhookError: vi.fn().mockResolvedValue(undefined),
  trackWebhookSuccess: vi.fn().mockResolvedValue(undefined),
}));

describe('POST /api/paypal/webhook', () => {
  const mockWebhookId = 'WH_TEST_123';
  const mockEventId = 'EVENT_123';
  const mockEventType = 'PAYMENT.CAPTURE.COMPLETED';

  const createRequest = (body: unknown, headers: Record<string, string> = {}): NextRequest => {
    const defaultHeaders = {
      'paypal-transmission-id': 'trans_123',
      'paypal-transmission-sig': 'sig_123',
      'paypal-transmission-time': '2024-01-01T00:00:00Z',
      'paypal-cert-url': 'https://api.paypal.com/cert',
      'paypal-auth-algo': 'SHA256withRSA',
      ...headers,
    };

    return new NextRequest('http://localhost:3000/api/paypal/webhook', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: defaultHeaders,
    });
  };

  const mockEvent = {
    id: mockEventId,
    event_type: mockEventType,
    resource_type: 'capture',
    resource: {
      id: 'CAPTURE_123',
      status: 'COMPLETED',
      amount: { currency_code: 'USD', value: '300.00' },
      custom_id: JSON.stringify({
        puppy_id: '923e4567-e89b-12d3-a456-426614174000',
        puppy_slug: 'test-puppy',
      }),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYPAL_WEBHOOK_ID = mockWebhookId;
  });

  it('processes valid webhook event successfully', async () => {
    const { verifyPayPalWebhookSignature } = await import('@/lib/paypal/webhook-verification');
    const { PayPalWebhookHandler } = await import('@/lib/paypal/webhook-handler');
    const { trackWebhookSuccess } = await import('@/lib/monitoring/webhook-alerts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (verifyPayPalWebhookSignature as any).mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (PayPalWebhookHandler.processEvent as any).mockResolvedValue({
      success: true,
      eventType: mockEventType,
      captureId: 'CAPTURE_123',
      reservationId: 'res_123',
    });

    const request = createRequest(mockEvent);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      received: true,
      eventType: mockEventType,
      duplicate: false,
    });

    expect(verifyPayPalWebhookSignature).toHaveBeenCalledWith({
      authAlgo: 'SHA256withRSA',
      certUrl: 'https://api.paypal.com/cert',
      transmissionId: 'trans_123',
      transmissionSig: 'sig_123',
      transmissionTime: '2024-01-01T00:00:00Z',
      webhookId: mockWebhookId,
      webhookEvent: mockEvent,
    });

    expect(trackWebhookSuccess).toHaveBeenCalledWith('paypal', mockEventType);
  });

  it('returns 500 when PAYPAL_WEBHOOK_ID is not configured', async () => {
    delete process.env.PAYPAL_WEBHOOK_ID;

    const request = createRequest(mockEvent);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'PayPal webhook ID is not configured' });
  });

  it('returns 400 when signature headers are missing', async () => {
    const request = createRequest(mockEvent, {
      'paypal-transmission-id': '',
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Missing PayPal signature headers' });
  });

  it('returns 400 when signature is invalid', async () => {
    const { verifyPayPalWebhookSignature } = await import('@/lib/paypal/webhook-verification');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (verifyPayPalWebhookSignature as any).mockResolvedValue(false);

    const request = createRequest(mockEvent);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid webhook signature' });
  });

  it('handles duplicate events successfully', async () => {
    const { verifyPayPalWebhookSignature } = await import('@/lib/paypal/webhook-verification');
    const { PayPalWebhookHandler } = await import('@/lib/paypal/webhook-handler');
    const { trackWebhookSuccess } = await import('@/lib/monitoring/webhook-alerts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (verifyPayPalWebhookSignature as any).mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (PayPalWebhookHandler.processEvent as any).mockResolvedValue({
      success: true,
      duplicate: true,
      eventType: mockEventType,
      captureId: 'CAPTURE_123',
    });

    const request = createRequest(mockEvent);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      received: true,
      eventType: mockEventType,
      duplicate: true,
    });

    expect(trackWebhookSuccess).toHaveBeenCalledWith('paypal', mockEventType);
  });

  it('returns 500 and sends alert when processing fails', async () => {
    const { verifyPayPalWebhookSignature } = await import('@/lib/paypal/webhook-verification');
    const { PayPalWebhookHandler } = await import('@/lib/paypal/webhook-handler');
    const { alertWebhookError } = await import('@/lib/monitoring/webhook-alerts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (verifyPayPalWebhookSignature as any).mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (PayPalWebhookHandler.processEvent as any).mockResolvedValue({
      success: false,
      error: 'Failed to create reservation',
      eventType: mockEventType,
    });

    const request = createRequest(mockEvent);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to create reservation',
      eventType: mockEventType,
    });

    expect(alertWebhookError).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'paypal',
        eventType: mockEventType,
        eventId: mockEventId,
        error: 'Failed to create reservation',
        puppyId: '923e4567-e89b-12d3-a456-426614174000',
      }),
    );
  });

  it('sends alert when processing fails without metadata', async () => {
    const { verifyPayPalWebhookSignature } = await import('@/lib/paypal/webhook-verification');
    const { PayPalWebhookHandler } = await import('@/lib/paypal/webhook-handler');
    const { alertWebhookError } = await import('@/lib/monitoring/webhook-alerts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (verifyPayPalWebhookSignature as any).mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (PayPalWebhookHandler.processEvent as any).mockResolvedValue({
      success: false,
      error: 'Missing metadata',
      eventType: mockEventType,
    });

    const eventWithoutMetadata = {
      ...mockEvent,
      resource: {
        id: 'CAPTURE_123',
        status: 'COMPLETED',
      },
    };

    const request = createRequest(eventWithoutMetadata);
    await POST(request);

    expect(alertWebhookError).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'paypal',
        eventType: mockEventType,
        eventId: mockEventId,
        error: 'Missing metadata',
        puppyId: undefined,
        customerEmail: undefined,
      }),
    );
  });

  it('handles unexpected errors and sends alert', async () => {
    const { verifyPayPalWebhookSignature } = await import('@/lib/paypal/webhook-verification');
    const { alertWebhookError } = await import('@/lib/monitoring/webhook-alerts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (verifyPayPalWebhookSignature as any).mockRejectedValue(new Error('Verification failed'));

    const request = createRequest(mockEvent);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Verification failed' });

    expect(alertWebhookError).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'paypal',
        eventType: 'unknown',
        eventId: 'unknown',
        error: 'Unexpected error: Verification failed',
      }),
    );
  });

  it('continues processing even if alert fails', async () => {
    const { verifyPayPalWebhookSignature } = await import('@/lib/paypal/webhook-verification');
    const { PayPalWebhookHandler } = await import('@/lib/paypal/webhook-handler');
    const { trackWebhookSuccess } = await import('@/lib/monitoring/webhook-alerts');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (verifyPayPalWebhookSignature as any).mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (PayPalWebhookHandler.processEvent as any).mockResolvedValue({
      success: true,
      eventType: mockEventType,
      captureId: 'CAPTURE_123',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trackWebhookSuccess as any).mockRejectedValue(new Error('Alert service down'));

    const request = createRequest(mockEvent);
    const response = await POST(request);

    // Should still return success even if alerting fails
    expect(response.status).toBe(200);
  });

  it('verifies all signature headers are passed correctly', async () => {
    const { verifyPayPalWebhookSignature } = await import('@/lib/paypal/webhook-verification');
    const { PayPalWebhookHandler } = await import('@/lib/paypal/webhook-handler');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (verifyPayPalWebhookSignature as any).mockResolvedValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (PayPalWebhookHandler.processEvent as any).mockResolvedValue({
      success: true,
      eventType: mockEventType,
    });

    const customHeaders = {
      'paypal-transmission-id': 'custom_trans',
      'paypal-transmission-sig': 'custom_sig',
      'paypal-transmission-time': '2024-12-31T23:59:59Z',
      'paypal-cert-url': 'https://custom.paypal.com/cert',
      'paypal-auth-algo': 'SHA512withRSA',
    };

    const request = createRequest(mockEvent, customHeaders);
    await POST(request);

    expect(verifyPayPalWebhookSignature).toHaveBeenCalledWith({
      authAlgo: 'SHA512withRSA',
      certUrl: 'https://custom.paypal.com/cert',
      transmissionId: 'custom_trans',
      transmissionSig: 'custom_sig',
      transmissionTime: '2024-12-31T23:59:59Z',
      webhookId: mockWebhookId,
      webhookEvent: mockEvent,
    });
  });
});
