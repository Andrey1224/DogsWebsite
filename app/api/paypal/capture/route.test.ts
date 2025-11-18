/**
 * PayPal Capture API Route Tests
 *
 * Tests the POST /api/paypal/capture endpoint that captures PayPal orders
 * and creates reservations. Validates metadata, prevents race conditions,
 * and ensures proper error handling and idempotency.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from './route';

vi.mock('@/lib/paypal/client', () => ({
  capturePayPalOrder: vi.fn(),
  getPayPalOrder: vi.fn(),
}));

vi.mock('@/lib/reservations/queries', () => ({
  ReservationQueries: {
    hasActiveReservation: vi.fn(),
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

describe('POST /api/paypal/capture', () => {
  const mockPuppyId = '923e4567-e89b-12d3-a456-426614174000';
  const mockOrderId = 'ORDER_123';
  const mockCaptureId = 'CAPTURE_123';
  const mockReservationId = 'res_123';

  const createRequest = (body: unknown): NextRequest => {
    return new NextRequest('http://localhost:3000/api/paypal/capture', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  const mockMetadata = {
    puppy_id: mockPuppyId,
    puppy_slug: 'test-puppy',
    puppy_name: 'Test Puppy',
    channel: 'site',
    deposit_amount: 300,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('captures PayPal order and creates reservation successfully', async () => {
    const { capturePayPalOrder, getPayPalOrder } = await import('@/lib/paypal/client');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { ReservationCreationService } = await import('@/lib/reservations/create');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPayPalOrder as any).mockResolvedValue({
      purchase_units: [
        {
          custom_id: JSON.stringify(mockMetadata),
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (capturePayPalOrder as any).mockResolvedValue({
      id: mockOrderId,
      status: 'COMPLETED',
      payer: {
        email_address: 'buyer@example.com',
        name: {
          given_name: 'Test',
          surname: 'Buyer',
        },
        phone: {
          phone_number: {
            national_number: '1234567890',
          },
        },
      },
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: mockCaptureId,
                amount: {
                  value: '300.00',
                  currency_code: 'USD',
                },
                custom_id: JSON.stringify(mockMetadata),
              },
            ],
          },
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationCreationService.createReservation as any).mockResolvedValue({
      reservationId: mockReservationId,
    });

    const request = createRequest({ orderId: mockOrderId });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      reservationId: mockReservationId,
      captureId: mockCaptureId,
      orderStatus: 'COMPLETED',
    });

    expect(ReservationCreationService.createReservation).toHaveBeenCalledWith({
      puppyId: mockPuppyId,
      customerEmail: 'buyer@example.com',
      customerName: 'Test Buyer',
      customerPhone: '1234567890',
      depositAmount: 300,
      paymentProvider: 'paypal',
      externalPaymentId: mockCaptureId,
      channel: 'site',
      notes: `PayPal capture ${mockCaptureId}`,
    });
  });

  it('returns 400 when orderId is missing', async () => {
    const request = createRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('returns 400 when puppy metadata is missing in order', async () => {
    const { getPayPalOrder } = await import('@/lib/paypal/client');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPayPalOrder as any).mockResolvedValue({
      purchase_units: [
        {
          custom_id: JSON.stringify({ other_data: 'test' }),
        },
      ],
    });

    const request = createRequest({ orderId: mockOrderId });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Missing puppy metadata' });
  });

  it('returns 409 when puppy has active reservation', async () => {
    const { getPayPalOrder } = await import('@/lib/paypal/client');
    const { ReservationQueries } = await import('@/lib/reservations/queries');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPayPalOrder as any).mockResolvedValue({
      purchase_units: [
        {
          custom_id: JSON.stringify(mockMetadata),
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(true);

    const request = createRequest({ orderId: mockOrderId });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toEqual({
      error: 'Reservation in progress - please try again in ~15 minutes',
    });
  });

  it('returns 409 when capture status is not COMPLETED', async () => {
    const { capturePayPalOrder, getPayPalOrder } = await import('@/lib/paypal/client');
    const { ReservationQueries } = await import('@/lib/reservations/queries');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPayPalOrder as any).mockResolvedValue({
      purchase_units: [
        {
          custom_id: JSON.stringify(mockMetadata),
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (capturePayPalOrder as any).mockResolvedValue({
      id: mockOrderId,
      status: 'PENDING',
    });

    const request = createRequest({ orderId: mockOrderId });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toEqual({
      error: 'Capture status is PENDING',
      status: 'PENDING',
    });
  });

  it('returns 500 when capture details are missing', async () => {
    const { capturePayPalOrder, getPayPalOrder } = await import('@/lib/paypal/client');
    const { ReservationQueries } = await import('@/lib/reservations/queries');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPayPalOrder as any).mockResolvedValue({
      purchase_units: [
        {
          custom_id: JSON.stringify(mockMetadata),
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (capturePayPalOrder as any).mockResolvedValue({
      id: mockOrderId,
      status: 'COMPLETED',
      purchase_units: [
        {
          payments: {
            captures: [],
          },
        },
      ],
    });

    const request = createRequest({ orderId: mockOrderId });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Capture details not found in response' });
  });

  it('returns 400 when customer email is missing', async () => {
    const { capturePayPalOrder, getPayPalOrder } = await import('@/lib/paypal/client');
    const { ReservationQueries } = await import('@/lib/reservations/queries');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPayPalOrder as any).mockResolvedValue({
      purchase_units: [
        {
          custom_id: JSON.stringify(mockMetadata),
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (capturePayPalOrder as any).mockResolvedValue({
      id: mockOrderId,
      status: 'COMPLETED',
      payer: {
        // No email_address
      },
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: mockCaptureId,
                amount: {
                  value: '300.00',
                  currency_code: 'USD',
                },
                custom_id: JSON.stringify(mockMetadata),
              },
            ],
          },
        },
      ],
    });

    const request = createRequest({ orderId: mockOrderId });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Missing customer email address' });
  });

  it('returns 400 when capture amount is invalid', async () => {
    const { capturePayPalOrder, getPayPalOrder } = await import('@/lib/paypal/client');
    const { ReservationQueries } = await import('@/lib/reservations/queries');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPayPalOrder as any).mockResolvedValue({
      purchase_units: [
        {
          custom_id: JSON.stringify(mockMetadata),
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (capturePayPalOrder as any).mockResolvedValue({
      id: mockOrderId,
      status: 'COMPLETED',
      payer: {
        email_address: 'buyer@example.com',
      },
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: mockCaptureId,
                amount: {
                  value: 'invalid',
                  currency_code: 'USD',
                },
                custom_id: JSON.stringify(mockMetadata),
              },
            ],
          },
        },
      ],
    });

    const request = createRequest({ orderId: mockOrderId });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Invalid capture amount' });
  });

  it('handles ReservationCreationError with 409 for race condition', async () => {
    const { capturePayPalOrder, getPayPalOrder } = await import('@/lib/paypal/client');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { ReservationCreationService, ReservationCreationError } = await import(
      '@/lib/reservations/create'
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPayPalOrder as any).mockResolvedValue({
      purchase_units: [
        {
          custom_id: JSON.stringify(mockMetadata),
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (capturePayPalOrder as any).mockResolvedValue({
      id: mockOrderId,
      status: 'COMPLETED',
      payer: {
        email_address: 'buyer@example.com',
      },
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: mockCaptureId,
                amount: {
                  value: '300.00',
                  currency_code: 'USD',
                },
                custom_id: JSON.stringify(mockMetadata),
              },
            ],
          },
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationCreationService.createReservation as any).mockRejectedValue(
      new ReservationCreationError('Race condition detected', 'RACE_CONDITION_LOST'),
    );

    const request = createRequest({ orderId: mockOrderId });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toEqual({
      error: 'Race condition detected',
      errorCode: 'RACE_CONDITION_LOST',
    });
  });

  it('handles ReservationCreationError with 500 for other errors', async () => {
    const { capturePayPalOrder, getPayPalOrder } = await import('@/lib/paypal/client');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { ReservationCreationService, ReservationCreationError } = await import(
      '@/lib/reservations/create'
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPayPalOrder as any).mockResolvedValue({
      purchase_units: [
        {
          custom_id: JSON.stringify(mockMetadata),
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (capturePayPalOrder as any).mockResolvedValue({
      id: mockOrderId,
      status: 'COMPLETED',
      payer: {
        email_address: 'buyer@example.com',
      },
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: mockCaptureId,
                amount: {
                  value: '300.00',
                  currency_code: 'USD',
                },
                custom_id: JSON.stringify(mockMetadata),
              },
            ],
          },
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationCreationService.createReservation as any).mockRejectedValue(
      new ReservationCreationError('Database error', 'DATABASE_ERROR'),
    );

    const request = createRequest({ orderId: mockOrderId });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Database error',
      errorCode: 'DATABASE_ERROR',
    });
  });

  it('uses metadata from capture if available', async () => {
    const { capturePayPalOrder, getPayPalOrder } = await import('@/lib/paypal/client');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { ReservationCreationService } = await import('@/lib/reservations/create');

    const enhancedMetadata = {
      ...mockMetadata,
      customer_email: 'metadata@example.com',
      customer_name: 'Metadata User',
      customer_phone: '9876543210',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPayPalOrder as any).mockResolvedValue({
      purchase_units: [
        {
          custom_id: JSON.stringify(mockMetadata),
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (capturePayPalOrder as any).mockResolvedValue({
      id: mockOrderId,
      status: 'COMPLETED',
      payer: {
        email_address: 'payer@example.com',
        name: {
          given_name: 'Payer',
          surname: 'Name',
        },
      },
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: mockCaptureId,
                amount: {
                  value: '300.00',
                  currency_code: 'USD',
                },
                custom_id: JSON.stringify(enhancedMetadata),
              },
            ],
          },
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationCreationService.createReservation as any).mockResolvedValue({
      reservationId: mockReservationId,
    });

    const request = createRequest({ orderId: mockOrderId });
    await POST(request);

    expect(ReservationCreationService.createReservation).toHaveBeenCalledWith({
      puppyId: mockPuppyId,
      customerEmail: 'metadata@example.com',
      customerName: 'Metadata User',
      customerPhone: '9876543210',
      depositAmount: 300,
      paymentProvider: 'paypal',
      externalPaymentId: mockCaptureId,
      channel: 'site',
      notes: `PayPal capture ${mockCaptureId}`,
    });
  });
});
