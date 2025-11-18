/**
 * PayPal Create Order API Route Tests
 *
 * Tests the POST /api/paypal/create-order endpoint that creates PayPal orders
 * for puppy deposits. Validates input, checks puppy availability, prevents
 * race conditions, and ensures proper error handling.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from './route';

vi.mock('@/lib/supabase/queries', () => ({
  getPuppyBySlug: vi.fn(),
}));

vi.mock('@/lib/reservations/queries', () => ({
  ReservationQueries: {
    hasActiveReservation: vi.fn(),
  },
}));

vi.mock('@/lib/paypal/client', () => ({
  createPayPalOrder: vi.fn(),
}));

vi.mock('@/lib/payments/deposit', () => ({
  calculateDepositAmount: vi.fn(),
}));

describe('POST /api/paypal/create-order', () => {
  const mockPuppyId = '923e4567-e89b-12d3-a456-426614174000';
  const mockPuppySlug = 'test-puppy';

  const createRequest = (body: unknown): NextRequest => {
    return new NextRequest('http://localhost:3000/api/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  });

  it('creates PayPal order successfully for available puppy', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { createPayPalOrder } = await import('@/lib/paypal/client');
    const { calculateDepositAmount } = await import('@/lib/payments/deposit');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue({
      id: mockPuppyId,
      name: 'Test Puppy',
      slug: mockPuppySlug,
      status: 'available',
      price_usd: 4500,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (calculateDepositAmount as any).mockReturnValue(300);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createPayPalOrder as any).mockResolvedValue({
      id: 'ORDER_123',
      status: 'CREATED',
    });

    const request = createRequest({ puppySlug: mockPuppySlug });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      orderId: 'ORDER_123',
      status: 'CREATED',
    });

    expect(createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 300,
        description: 'Deposit for Test Puppy',
        metadata: expect.objectContaining({
          puppy_id: mockPuppyId,
          puppy_slug: mockPuppySlug,
          puppy_name: 'Test Puppy',
          channel: 'site',
          deposit_amount: 300,
        }),
        returnUrl: `http://localhost:3000/puppies/${mockPuppySlug}/reserved?paypal=success`,
        cancelUrl: `http://localhost:3000/puppies/${mockPuppySlug}?paypal=cancelled`,
      }),
    );
  });

  it('returns 404 when puppy is not found', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue(null);

    const request = createRequest({ puppySlug: 'nonexistent-puppy' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Puppy not found' });
  });

  it('returns 409 when puppy is not available', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue({
      id: mockPuppyId,
      name: 'Test Puppy',
      slug: mockPuppySlug,
      status: 'reserved',
      price_usd: 4500,
    });

    const request = createRequest({ puppySlug: mockPuppySlug });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toEqual({ error: 'This puppy is reserved and cannot be reserved' });
  });

  it('returns 409 when puppy has active reservation', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue({
      id: mockPuppyId,
      name: 'Test Puppy',
      slug: mockPuppySlug,
      status: 'available',
      price_usd: 4500,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(true);

    const request = createRequest({ puppySlug: mockPuppySlug });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toEqual({
      error: 'Reservation in progress - please try again in ~15 minutes',
    });
  });

  it('returns 400 when puppySlug is missing', async () => {
    const request = createRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('returns 400 when puppySlug is empty', async () => {
    const request = createRequest({ puppySlug: '' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('returns 500 when PayPal API fails', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { createPayPalOrder } = await import('@/lib/paypal/client');
    const { calculateDepositAmount } = await import('@/lib/payments/deposit');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue({
      id: mockPuppyId,
      name: 'Test Puppy',
      slug: mockPuppySlug,
      status: 'available',
      price_usd: 4500,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (calculateDepositAmount as any).mockReturnValue(300);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createPayPalOrder as any).mockRejectedValue(new Error('PayPal API Error'));

    const request = createRequest({ puppySlug: mockPuppySlug });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'PayPal API Error' });
  });

  it('handles puppy with null name gracefully', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { createPayPalOrder } = await import('@/lib/paypal/client');
    const { calculateDepositAmount } = await import('@/lib/payments/deposit');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue({
      id: mockPuppyId,
      name: null,
      slug: mockPuppySlug,
      status: 'available',
      price_usd: 4500,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (calculateDepositAmount as any).mockReturnValue(300);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createPayPalOrder as any).mockResolvedValue({
      id: 'ORDER_123',
      status: 'CREATED',
    });

    const request = createRequest({ puppySlug: mockPuppySlug });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Deposit for Bulldog Puppy',
        metadata: expect.objectContaining({
          puppy_name: 'Bulldog Puppy',
        }),
      }),
    );
  });

  it('uses NEXT_PUBLIC_SITE_URL for return and cancel URLs', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { createPayPalOrder } = await import('@/lib/paypal/client');
    const { calculateDepositAmount } = await import('@/lib/payments/deposit');

    process.env.NEXT_PUBLIC_SITE_URL = 'https://exoticbulldoglegacy.com';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue({
      id: mockPuppyId,
      name: 'Test Puppy',
      slug: mockPuppySlug,
      status: 'available',
      price_usd: 4500,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (calculateDepositAmount as any).mockReturnValue(300);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (createPayPalOrder as any).mockResolvedValue({
      id: 'ORDER_123',
      status: 'CREATED',
    });

    const request = createRequest({ puppySlug: mockPuppySlug });
    await POST(request);

    expect(createPayPalOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        returnUrl: `https://exoticbulldoglegacy.com/puppies/${mockPuppySlug}/reserved?paypal=success`,
        cancelUrl: `https://exoticbulldoglegacy.com/puppies/${mockPuppySlug}?paypal=cancelled`,
      }),
    );
  });
});
