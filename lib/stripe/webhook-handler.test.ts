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

vi.mock('@/lib/reservations/create', () => ({
  ReservationCreationService: {
    createReservation: vi.fn(),
  },
}));

describe('StripeWebhookHandler', () => {
  const mockPuppyId = '123e4567-e89b-12d3-a456-426614174000';
  const mockPaymentIntentId = 'pi_test123';
  const mockSessionId = 'cs_test_session123';
  const mockEventId = 'evt_test_event123';

  const createMockSession = (overrides?: Partial<TypedCheckoutSession>): TypedCheckoutSession => ({
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
      customer_email: 'test@example.com',
      channel: 'site',
    },
    ...overrides,
  } as TypedCheckoutSession);

  const createMockEvent = (
    type: string,
    session: TypedCheckoutSession
  ): any => ({
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
        success: true,
        reservation: {
          id: 'res_123',
          puppy_id: mockPuppyId,
          customer_email: 'test@example.com',
          status: 'paid',
        },
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
      expect(result.duplicate).toBeUndefined();

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
      expect(result.error).toContain('Missing required metadata: puppy_id');
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

    it('should handle race condition errors gracefully', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { ReservationCreationService } = await import('@/lib/reservations/create');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      (ReservationCreationService.createReservation as any).mockResolvedValue({
        success: false,
        error: 'Puppy no longer available',
        errorCode: 'RACE_CONDITION_LOST',
      });

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
        success: true,
        reservation: {
          id: 'res_123',
          puppy_id: mockPuppyId,
        },
      });

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
      });

      const session = createMockSession();
      const event = createMockEvent('checkout.session.async_payment_succeeded', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('checkout.session.async_payment_succeeded');
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
        })
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

  describe('Error handling', () => {
    it('should handle reservation creation errors', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { ReservationCreationService } = await import('@/lib/reservations/create');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      (ReservationCreationService.createReservation as any).mockResolvedValue({
        success: false,
        error: 'Database connection failed',
        errorCode: 'DATABASE_ERROR',
      });

      const session = createMockSession();
      const event = createMockEvent('checkout.session.completed', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });
});
