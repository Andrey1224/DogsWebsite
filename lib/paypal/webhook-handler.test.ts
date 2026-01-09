/**
 * PayPal Webhook Handler Tests
 *
 * Ensures PayPal webhook events are processed with the same robustness
 * as the Stripe implementation, covering happy paths, duplicates, and
 * error conditions.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PayPalWebhookHandler } from './webhook-handler';
import { ReservationQueries } from '@/lib/reservations/queries';
import type { PayPalWebhookEvent } from './types';

vi.mock('@/lib/reservations/idempotency', () => ({
  idempotencyManager: {
    checkWebhookEvent: vi.fn(),
    createWebhookEvent: vi.fn(),
  },
}));

vi.mock('@/lib/reservations/queries', () => ({
  ReservationQueries: {
    updateStatus: vi.fn().mockResolvedValue({ id: 'test-reservation-id', status: 'paid' }),
    getByPayment: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue({ id: 'test-reservation-id', status: 'refunded' }),
  },
}));

vi.mock('@/lib/reservations/create', () => {
  class ReservationCreationError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
      this.name = 'ReservationCreationError';
    }
  }

  return {
    ReservationCreationService: {
      createReservation: vi.fn(),
    },
    ReservationCreationError,
  };
});

vi.mock('./client', () => ({
  getPayPalOrder: vi.fn(),
}));

vi.mock('@/lib/emails/refund-notifications', () => ({
  sendOwnerRefundNotification: vi.fn().mockResolvedValue({ success: true }),
  sendCustomerRefundNotification: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/supabase/client', () => {
  const createMockQueryBuilder = () => {
    const mockQueryBuilder: any = {
      select: vi.fn(() => mockQueryBuilder),
      eq: vi.fn(() => mockQueryBuilder),
      single: vi.fn(() =>
        Promise.resolve({
          data: { name: 'Test Puppy', slug: 'test-puppy' },
          error: null,
        }),
      ),
      maybeSingle: vi.fn(() =>
        Promise.resolve({
          data: null,
          error: null,
        }),
      ),
    };
    return mockQueryBuilder;
  };

  return {
    createServiceRoleClient: vi.fn(() => ({
      from: vi.fn(() => createMockQueryBuilder()),
    })),
    createSupabaseClient: vi.fn(() => ({
      from: vi.fn(() => createMockQueryBuilder()),
    })),
  };
});

describe('PayPalWebhookHandler', () => {
  const mockEventId = 'WH-TEST-123';
  const mockCaptureId = 'CAPTURE-123';
  const mockOrderId = 'ORDER-123';
  const mockPuppyId = '923e4567-e89b-12d3-a456-426614174000';
  const mockEmail = 'buyer@example.com';

  const createEvent = (
    overrides?: Partial<PayPalWebhookEvent<Record<string, unknown>>>,
  ): PayPalWebhookEvent<Record<string, unknown>> => ({
    id: mockEventId,
    event_type: 'PAYMENT.CAPTURE.COMPLETED',
    resource_type: 'capture',
    resource: {
      id: mockCaptureId,
      status: 'COMPLETED',
      amount: { currency_code: 'USD', value: '300.00' },
      custom_id: JSON.stringify({
        puppy_id: mockPuppyId,
        puppy_slug: 'test-puppy',
        channel: 'site',
      }),
      supplementary_data: {
        related_ids: {
          order_id: mockOrderId,
        },
      },
    },
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processes PAYMENT.CAPTURE.COMPLETED successfully', async () => {
    const { idempotencyManager } = await import('@/lib/reservations/idempotency');
    const { ReservationCreationService } = await import('@/lib/reservations/create');
    const { getPayPalOrder } = await import('./client');

    (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
      exists: false,
    });

    (getPayPalOrder as any).mockResolvedValue({
      payer: {
        email_address: mockEmail,
        name: { given_name: 'Test', surname: 'Buyer' },
      },
    });

    (ReservationCreationService.createReservation as any).mockResolvedValue({
      reservationId: 'res_123',
    });

    const event = createEvent();
    const result = await PayPalWebhookHandler.processEvent(event);

    expect(result.success).toBe(true);
    expect(result.captureId).toBe(mockCaptureId);
    expect(result.orderId).toBe(mockOrderId);
    expect(result.reservationId).toBe('res_123');
    expect(ReservationCreationService.createReservation).toHaveBeenCalledWith(
      expect.objectContaining({
        puppyId: mockPuppyId,
        customerEmail: mockEmail,
        paymentProvider: 'paypal',
        externalPaymentId: mockCaptureId,
      }),
      expect.objectContaining({
        provider: 'paypal',
        eventId: mockEventId,
        eventType: 'PAYMENT.CAPTURE.COMPLETED',
      }),
    );

    // Verify reservation status is updated to 'paid'
    expect(ReservationQueries.updateStatus).toHaveBeenCalledWith('res_123', 'paid');
  });

  it('detects duplicate events via idempotency manager', async () => {
    const { idempotencyManager } = await import('@/lib/reservations/idempotency');

    (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
      exists: true,
    });

    const event = createEvent();
    const result = await PayPalWebhookHandler.processEvent(event);

    expect(result.success).toBe(true);
    expect(result.duplicate).toBe(true);
    expect(result.captureId).toBe(mockCaptureId);
  });

  it('fails when metadata is missing', async () => {
    const { idempotencyManager } = await import('@/lib/reservations/idempotency');

    (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
      exists: false,
    });

    const event = createEvent({
      resource: {
        id: mockCaptureId,
        status: 'COMPLETED',
        amount: { currency_code: 'USD', value: '300.00' },
      },
    });

    const result = await PayPalWebhookHandler.processEvent(event);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/metadata/i);
  });

  it('fails when capture status is not COMPLETED', async () => {
    const { idempotencyManager } = await import('@/lib/reservations/idempotency');

    (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
      exists: false,
    });

    const event = createEvent({
      resource: {
        id: mockCaptureId,
        status: 'PENDING',
        amount: { currency_code: 'USD', value: '300.00' },
        custom_id: JSON.stringify({ puppy_id: mockPuppyId }),
      },
    });

    const result = await PayPalWebhookHandler.processEvent(event);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Capture status/i);
  });

  it('fails when customer email is unavailable', async () => {
    const { idempotencyManager } = await import('@/lib/reservations/idempotency');
    const { getPayPalOrder } = await import('./client');

    (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
      exists: false,
    });

    (getPayPalOrder as any).mockResolvedValue({
      payer: {
        email_address: undefined,
      },
    });

    const event = createEvent();
    const result = await PayPalWebhookHandler.processEvent(event);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/customer email/i);
  });

  it('propagates reservation creation errors', async () => {
    const { idempotencyManager } = await import('@/lib/reservations/idempotency');
    const { ReservationCreationService } = await import('@/lib/reservations/create');
    const { getPayPalOrder } = await import('./client');

    (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
      exists: false,
    });

    (getPayPalOrder as any).mockResolvedValue({
      payer: {
        email_address: mockEmail,
      },
    });

    const { ReservationCreationError } = await import('@/lib/reservations/create');

    (ReservationCreationService.createReservation as any).mockRejectedValue(
      new ReservationCreationError('Database error', 'DATABASE_ERROR'),
    );

    const event = createEvent();
    const result = await PayPalWebhookHandler.processEvent(event);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
    expect(result.errorCode).toBe('DATABASE_ERROR');
  });

  it('processes PAYMENT.CAPTURE.REFUNDED successfully', async () => {
    const mockReservationId = 'res_456';

    const { idempotencyManager } = await import('@/lib/reservations/idempotency');

    (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
      exists: false,
    });

    (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
      success: true,
    });

    (ReservationQueries.getByPayment as any).mockResolvedValue({
      id: mockReservationId,
      puppy_id: mockPuppyId,
      status: 'paid',
      customer_name: 'Test Customer',
      customer_email: mockEmail,
      deposit_amount: 300,
      notes: 'Original payment',
    });

    (ReservationQueries.update as any).mockResolvedValue({
      id: mockReservationId,
      status: 'refunded',
    });

    const refundEvent: PayPalWebhookEvent<Record<string, unknown>> = {
      id: mockEventId,
      event_type: 'PAYMENT.CAPTURE.REFUNDED',
      resource_type: 'capture',
      resource: {
        id: mockCaptureId,
        status: 'REFUNDED',
        amount: {
          value: '300.00',
          currency_code: 'USD',
        },
        custom_id: JSON.stringify({
          puppy_id: mockPuppyId,
          puppy_slug: 'test-puppy',
          puppy_name: 'Test Puppy',
          channel: 'site',
        }),
      },
      create_time: new Date().toISOString(),
    };

    const result = await PayPalWebhookHandler.processEvent(refundEvent);

    expect(result.success).toBe(true);
    expect(result.eventType).toBe('PAYMENT.CAPTURE.REFUNDED');
    expect(result.captureId).toBe(mockCaptureId);
    expect(result.reservationId).toBe(mockReservationId);

    // Verify reservation was found by capture ID
    expect(ReservationQueries.getByPayment).toHaveBeenCalledWith('paypal', mockCaptureId);

    // Verify status was updated to refunded
    expect(ReservationQueries.update).toHaveBeenCalledWith(
      mockReservationId,
      expect.objectContaining({
        status: 'refunded',
        notes: expect.stringContaining('PayPal Refund'),
      }),
    );
  });

  it('handles PAYMENT.CAPTURE.REFUNDED with missing reservation', async () => {
    (ReservationQueries.getByPayment as any).mockResolvedValue(null);

    const refundEvent: PayPalWebhookEvent<Record<string, unknown>> = {
      id: mockEventId,
      event_type: 'PAYMENT.CAPTURE.REFUNDED',
      resource_type: 'capture',
      resource: {
        id: mockCaptureId,
        status: 'REFUNDED',
        amount: {
          value: '300.00',
          currency_code: 'USD',
        },
      },
      create_time: new Date().toISOString(),
    };

    const result = await PayPalWebhookHandler.processEvent(refundEvent);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Reservation not found');
  });

  it('handles PAYMENT.CAPTURE.REFUNDED with invalid resource', async () => {
    const refundEvent: PayPalWebhookEvent<Record<string, unknown>> = {
      id: mockEventId,
      event_type: 'PAYMENT.CAPTURE.REFUNDED',
      resource_type: 'capture',
      resource: {
        invalid: 'data',
      },
      create_time: new Date().toISOString(),
    };

    const result = await PayPalWebhookHandler.processEvent(refundEvent);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid capture resource');
  });

  it('handles PAYMENT.CAPTURE.REFUNDED update failure', async () => {
    const mockReservationId = 'res_456';

    (ReservationQueries.getByPayment as any).mockResolvedValue({
      id: mockReservationId,
      puppy_id: mockPuppyId,
      status: 'paid',
      customer_name: 'Test Customer',
      customer_email: mockEmail,
    });

    (ReservationQueries.update as any).mockRejectedValue(new Error('Database error'));

    const refundEvent: PayPalWebhookEvent<Record<string, unknown>> = {
      id: mockEventId,
      event_type: 'PAYMENT.CAPTURE.REFUNDED',
      resource_type: 'capture',
      resource: {
        id: mockCaptureId,
        status: 'REFUNDED',
        amount: {
          value: '300.00',
          currency_code: 'USD',
        },
      },
      create_time: new Date().toISOString(),
    };

    const result = await PayPalWebhookHandler.processEvent(refundEvent);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to update reservation status');
  });
});
