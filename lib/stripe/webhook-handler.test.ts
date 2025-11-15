/**
 * Stripe Webhook Handler Tests
 *
 * Comprehensive test coverage for webhook event processing,
 * idempotency, and error handling.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StripeWebhookHandler } from './webhook-handler';
import type Stripe from 'stripe';
import type { TypedCheckoutSession } from './types';

// Mock modules
vi.mock('./client', () => ({
  stripe: {},
  webhookSecret: 'whsec_test_secret',
}));

vi.mock('@/lib/reservations/idempotency', () => ({
  idempotencyManager: {
    checkWebhookEvent: vi.fn(),
    createWebhookEvent: vi.fn(),
  },
}));

vi.mock('@/lib/emails/async-payment-failed', () => ({
  sendAsyncPaymentFailedEmail: vi.fn().mockResolvedValue({ success: true }),
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

describe('StripeWebhookHandler', () => {
  const mockPuppyId = '123e4567-e89b-12d3-a456-426614174000';
  const mockPaymentIntentId = 'pi_test123';
  const mockSessionId = 'cs_test_session123';
  const mockEventId = 'evt_test_event123';

  const createMockSession = (overrides?: Partial<TypedCheckoutSession>): TypedCheckoutSession =>
    ({
      id: mockSessionId,
      object: 'checkout.session',
      mode: 'payment',
      payment_status: 'paid',
      payment_intent: mockPaymentIntentId,
      amount_total: 30000, // $300 in cents
      customer_details: {
        email: 'test@example.com',
        name: 'Test Customer',
        phone: '+12025551234',
        address: null,
        tax_exempt: 'none',
        tax_ids: [],
      },
      metadata: {
        puppy_id: mockPuppyId,
        puppy_slug: 'test-puppy',
        puppy_name: 'Test Puppy',
        customer_email: 'test@example.com',
        channel: 'site',
      },
      ...overrides,
    }) as TypedCheckoutSession;

  const createMockEvent = (type: string, session: TypedCheckoutSession): any => ({
    id: mockEventId,
    object: 'event',
    type: type as Stripe.Event.Type,
    data: {
      object: session,
    } as any, // Type assertion to bypass complex union type
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 0,
    request: null,
    api_version: '2025-09-30.clover',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkout.session.completed', () => {
    it('should successfully process paid checkout session', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { ReservationCreationService } = await import('@/lib/reservations/create');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      (ReservationCreationService.createReservation as any).mockResolvedValue({
        reservationId: 'res_123',
      });

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
      });

      const session = createMockSession();
      const event = createMockEvent('checkout.session.completed', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('checkout.session.completed');
      expect(result.paymentIntentId).toBe(mockPaymentIntentId);
      expect(result.reservationId).toBe('res_123');

      expect(ReservationCreationService.createReservation).toHaveBeenCalledWith({
        puppyId: mockPuppyId,
        customerEmail: 'test@example.com',
        customerName: 'Test Customer',
        customerPhone: '+12025551234',
        depositAmount: 300, // Converted from cents
        paymentProvider: 'stripe',
        externalPaymentId: mockPaymentIntentId,
        channel: 'site',
        notes: `Stripe Checkout Session: ${mockSessionId}`,
      });
    });

    it('should detect duplicate events via idempotency check', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: true,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      const session = createMockSession();
      const event = createMockEvent('checkout.session.completed', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(true);
      expect(result.paymentIntentId).toBe(mockPaymentIntentId);
    });

    it('should handle missing metadata gracefully', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      const session = createMockSession({
        metadata: {} as any, // Missing puppy_id
      });
      const event = createMockEvent('checkout.session.completed', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required session metadata');
    });

    it('should handle unpaid status (async payment pending)', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
      });

      const session = createMockSession({
        payment_status: 'unpaid',
      });
      const event = createMockEvent('checkout.session.completed', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.error).toContain('Payment pending');
      expect(idempotencyManager.createWebhookEvent).toHaveBeenCalled();
    });

    it('should reject sessions with invalid amount totals', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { ReservationCreationService } = await import('@/lib/reservations/create');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      const session = createMockSession({ amount_total: 0 });
      const event = createMockEvent('checkout.session.completed', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid checkout amount');
      expect(ReservationCreationService.createReservation).not.toHaveBeenCalled();
    });

    it('should handle race condition errors gracefully', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { ReservationCreationService } = await import('@/lib/reservations/create');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      const { ReservationCreationError } = await import('@/lib/reservations/create');

      (ReservationCreationService.createReservation as any).mockRejectedValue(
        new ReservationCreationError('Puppy no longer available', 'RACE_CONDITION_LOST'),
      );

      const session = createMockSession();
      const event = createMockEvent('checkout.session.completed', session);

      const result = await StripeWebhookHandler.processEvent(event);

      // Should return success with duplicate flag to prevent retry
      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(true);
      expect(result.error).toBe('Puppy no longer available');
    });
  });

  describe('checkout.session.async_payment_succeeded', () => {
    it('should process async payment success event', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { ReservationCreationService } = await import('@/lib/reservations/create');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      (ReservationCreationService.createReservation as any).mockResolvedValue({
        reservationId: 'res_123',
      });

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
      });

      const session = createMockSession();
      const event = createMockEvent('checkout.session.async_payment_succeeded', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('checkout.session.async_payment_succeeded');
      expect(result.reservationId).toBe('res_123');
      expect(ReservationCreationService.createReservation).toHaveBeenCalled();
    });

    it('should detect duplicate async payment events', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: true,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      const session = createMockSession();
      const event = createMockEvent('checkout.session.async_payment_succeeded', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(true);
    });
  });

  describe('checkout.session.async_payment_failed', () => {
    it('should handle async payment failure event', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
      });

      const session = createMockSession();
      const event = createMockEvent('checkout.session.async_payment_failed', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('checkout.session.async_payment_failed');
      expect(result.error).toBe('Async payment failed');
      expect(idempotencyManager.createWebhookEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'stripe',
          eventId: mockEventId,
          eventType: 'checkout.session.async_payment_failed',
        }),
      );
    });

    it('prefers customer_details over metadata when sending async failure email', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { sendAsyncPaymentFailedEmail } = await import('@/lib/emails/async-payment-failed');

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
      });

      const session = createMockSession({
        metadata: {
          puppy_id: mockPuppyId,
          puppy_slug: 'test-puppy',
          puppy_name: 'Test Puppy',
          customer_email: 'metadata@example.com',
          customer_name: 'Metadata Name',
          channel: 'site',
        },
        customer_details: {
          email: 'customer-from-session@example.com',
          name: 'Customer Session',
          phone: '+12025550000',
          address: null,
          tax_exempt: 'none',
          tax_ids: [],
          business_name: null,
          individual_name: null,
        },
      });

      const event = createMockEvent('checkout.session.async_payment_failed', session);

      await StripeWebhookHandler.processEvent(event);

      expect(sendAsyncPaymentFailedEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          customerEmail: 'customer-from-session@example.com',
          customerName: 'Customer Session',
          puppyName: 'Test Puppy',
        }),
      );
    });
  });

  describe('checkout.session.expired', () => {
    it('should handle expired session event', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
      });

      const session = createMockSession();
      const event = createMockEvent('checkout.session.expired', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('checkout.session.expired');
      expect(result.error).toContain('Session expired');
      expect(idempotencyManager.createWebhookEvent).toHaveBeenCalled();
    });
  });

  describe('Unhandled event types', () => {
    it('should return success for unhandled event types', async () => {
      const session = createMockSession();
      const event = createMockEvent('payment_intent.succeeded', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.error).toContain('Unhandled event type');
    });
  });

  describe('Event guard rails', () => {
    it('skips stale events based on creation timestamp', async () => {
      const now = Date.now();
      const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(now);

      const session = createMockSession();
      const event = createMockEvent('checkout.session.completed', session);
      event.created = Math.floor(now / 1000) - (60 * 60 * 2 + 30);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(false);
      expect(result.error).toContain('stale');

      nowSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle reservation creation errors', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { ReservationCreationService } = await import('@/lib/reservations/create');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      const { ReservationCreationError } = await import('@/lib/reservations/create');

      (ReservationCreationService.createReservation as any).mockRejectedValue(
        new ReservationCreationError('Database connection failed', 'DATABASE_ERROR'),
      );

      const session = createMockSession();
      const event = createMockEvent('checkout.session.completed', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.errorCode).toBe('DATABASE_ERROR');
    });
  });
});
