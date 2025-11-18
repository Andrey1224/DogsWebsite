/**
 * Puppy Checkout Actions Tests
 *
 * Tests the critical server action for creating Stripe Checkout Sessions.
 * Validates puppy availability checks, deposit calculations, mock mode,
 * and proper error handling.
 */

import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import type { CreateCheckoutSessionResult } from './actions';

// Mock dependencies
vi.mock('@/lib/stripe/client', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

vi.mock('@/lib/supabase/queries', () => ({
  getPuppyBySlug: vi.fn(),
}));

vi.mock('@/lib/reservations/queries', () => ({
  ReservationQueries: {
    hasActiveReservation: vi.fn(),
  },
}));

vi.mock('@/lib/payments/deposit', () => ({
  calculateDepositAmount: vi.fn(),
}));

const BASE_ENV = { ...process.env };

describe('createCheckoutSession', () => {
  const mockPuppyId = '923e4567-e89b-12d3-a456-426614174000';
  const mockPuppySlug = 'bella';

  const mockPuppy = {
    id: mockPuppyId,
    slug: mockPuppySlug,
    name: 'Bella',
    status: 'available' as const,
    price_usd: 4500,
    photo_urls: ['https://example.com/bella.jpg'],
  };

  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, BASE_ENV);
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://exoticbulldoglegacy.com';
    delete process.env.PLAYWRIGHT_MOCK_RESERVATION;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates checkout session successfully for available puppy', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { calculateDepositAmount } = await import('@/lib/payments/deposit');
    const { stripe } = await import('@/lib/stripe/client');
    const { createCheckoutSession } = await import('./actions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue(mockPuppy);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (calculateDepositAmount as any).mockReturnValue(300);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.checkout.sessions.create as any).mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });

    const result = await createCheckoutSession(mockPuppySlug);

    expect(result.success).toBe(true);
    expect(result.sessionUrl).toBe('https://checkout.stripe.com/c/pay/cs_test_123');
    expect(result.error).toBeUndefined();

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: 30000, // $300 in cents
              product_data: {
                name: 'Deposit for Bella',
                description: 'Reserve your Bella with a $300 deposit',
                images: ['https://example.com/bella.jpg'],
              },
            },
            quantity: 1,
          },
        ],
        customer_creation: 'always',
        phone_number_collection: {
          enabled: true,
        },
        metadata: {
          puppy_id: mockPuppyId,
          puppy_slug: mockPuppySlug,
          puppy_name: 'Bella',
          channel: 'site',
        },
        success_url: `https://exoticbulldoglegacy.com/puppies/${mockPuppySlug}/reserved?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://exoticbulldoglegacy.com/puppies/${mockPuppySlug}`,
        expires_at: expect.any(Number),
      }),
    );
  });

  it('returns error when puppy is not found', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { createCheckoutSession } = await import('./actions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue(null);

    const result = await createCheckoutSession('nonexistent');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Puppy not found');
    expect(result.errorCode).toBe('PUPPY_NOT_FOUND');
    expect(result.sessionUrl).toBeUndefined();
  });

  it('returns error when puppy status is not available', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { createCheckoutSession } = await import('./actions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue({
      ...mockPuppy,
      status: 'reserved',
    });

    const result = await createCheckoutSession(mockPuppySlug);

    expect(result.success).toBe(false);
    expect(result.error).toBe('This puppy is reserved and cannot be reserved');
    expect(result.errorCode).toBe('PUPPY_NOT_AVAILABLE');
  });

  it('returns error when puppy has active reservation', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { createCheckoutSession } = await import('./actions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue(mockPuppy);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(true);

    const result = await createCheckoutSession(mockPuppySlug);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Reservation in progress - please try again in ~15 minutes');
    expect(result.errorCode).toBe('PUPPY_NOT_AVAILABLE');
  });

  it('returns mock checkout URL in Playwright mode', async () => {
    process.env.PLAYWRIGHT_MOCK_RESERVATION = 'true';
    vi.resetModules();

    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { createCheckoutSession } = await import('./actions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue(mockPuppy);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);

    const result = await createCheckoutSession(mockPuppySlug);

    expect(result.success).toBe(true);
    expect(result.sessionUrl).toBe(`/mock-checkout?puppy=${encodeURIComponent(mockPuppySlug)}`);
  });

  it('handles Stripe API errors gracefully', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { calculateDepositAmount } = await import('@/lib/payments/deposit');
    const { stripe } = await import('@/lib/stripe/client');
    const { createCheckoutSession } = await import('./actions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue(mockPuppy);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (calculateDepositAmount as any).mockReturnValue(300);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.checkout.sessions.create as any).mockRejectedValue(
      new Error('Stripe API error: Invalid amount'),
    );

    const result = await createCheckoutSession(mockPuppySlug);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Stripe API error: Invalid amount');
    expect(result.errorCode).toBe('STRIPE_ERROR');
  });

  it('handles puppy without name gracefully', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { calculateDepositAmount } = await import('@/lib/payments/deposit');
    const { stripe } = await import('@/lib/stripe/client');
    const { createCheckoutSession } = await import('./actions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue({
      ...mockPuppy,
      name: null,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (calculateDepositAmount as any).mockReturnValue(300);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.checkout.sessions.create as any).mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });

    const result = await createCheckoutSession(mockPuppySlug);

    expect(result.success).toBe(true);
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          {
            price_data: expect.objectContaining({
              product_data: expect.objectContaining({
                name: 'Deposit for Bulldog Puppy',
              }),
            }),
            quantity: 1,
          },
        ],
        metadata: expect.objectContaining({
          puppy_name: 'Bulldog Puppy',
        }),
      }),
    );
  });

  it('handles puppy without photos', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { calculateDepositAmount } = await import('@/lib/payments/deposit');
    const { stripe } = await import('@/lib/stripe/client');
    const { createCheckoutSession } = await import('./actions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue({
      ...mockPuppy,
      photo_urls: null,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (calculateDepositAmount as any).mockReturnValue(300);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.checkout.sessions.create as any).mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });

    const result = await createCheckoutSession(mockPuppySlug);

    expect(result.success).toBe(true);
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          {
            price_data: expect.objectContaining({
              product_data: expect.objectContaining({
                images: undefined,
              }),
            }),
            quantity: 1,
          },
        ],
      }),
    );
  });

  it('uses localhost when NEXT_PUBLIC_SITE_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    vi.resetModules();

    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { calculateDepositAmount } = await import('@/lib/payments/deposit');
    const { stripe } = await import('@/lib/stripe/client');
    const { createCheckoutSession } = await import('./actions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue(mockPuppy);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (calculateDepositAmount as any).mockReturnValue(300);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.checkout.sessions.create as any).mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });

    await createCheckoutSession(mockPuppySlug);

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: `http://localhost:3000/puppies/${mockPuppySlug}/reserved?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/puppies/${mockPuppySlug}`,
      }),
    );
  });

  it('handles different puppy statuses correctly', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { createCheckoutSession } = await import('./actions');

    const statuses = ['sold', 'upcoming', 'reserved'] as const;

    for (const status of statuses) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (getPuppyBySlug as any).mockResolvedValue({
        ...mockPuppy,
        status,
      });

      const result = await createCheckoutSession(mockPuppySlug);

      expect(result.success).toBe(false);
      expect(result.error).toBe(`This puppy is ${status} and cannot be reserved`);
      expect(result.errorCode).toBe('PUPPY_NOT_AVAILABLE');
    }
  });

  it('calculates deposit amount correctly', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { calculateDepositAmount } = await import('@/lib/payments/deposit');
    const { stripe } = await import('@/lib/stripe/client');
    const { createCheckoutSession } = await import('./actions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue(mockPuppy);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (calculateDepositAmount as any).mockReturnValue(300);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.checkout.sessions.create as any).mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });

    await createCheckoutSession(mockPuppySlug);

    expect(calculateDepositAmount).toHaveBeenCalledWith({
      priceUsd: 4500,
      fixedAmount: 300,
    });
  });

  it('sets session expiration to 24 hours', async () => {
    const { getPuppyBySlug } = await import('@/lib/supabase/queries');
    const { ReservationQueries } = await import('@/lib/reservations/queries');
    const { calculateDepositAmount } = await import('@/lib/payments/deposit');
    const { stripe } = await import('@/lib/stripe/client');
    const { createCheckoutSession } = await import('./actions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getPuppyBySlug as any).mockResolvedValue(mockPuppy);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ReservationQueries.hasActiveReservation as any).mockResolvedValue(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (calculateDepositAmount as any).mockReturnValue(300);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stripe.checkout.sessions.create as any).mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/c/pay/cs_test_123',
    });

    const beforeTime = Math.floor(Date.now() / 1000);
    await createCheckoutSession(mockPuppySlug);
    const afterTime = Math.floor(Date.now() / 1000);

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        expires_at: expect.any(Number),
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callArgs = (stripe.checkout.sessions.create as any).mock.calls[0][0];
    const expiresAt = callArgs.expires_at;

    // Should be ~24 hours from now
    const expectedExpiry = beforeTime + 24 * 60 * 60;
    expect(expiresAt).toBeGreaterThanOrEqual(expectedExpiry - 5);
    expect(expiresAt).toBeLessThanOrEqual(afterTime + 24 * 60 * 60 + 5);
  });
});
