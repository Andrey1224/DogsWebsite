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
    markAsProcessed: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('@/lib/webhooks/webhook-events-server', () => ({
  WebhookEventsServer: {
    markProcessing: vi.fn().mockResolvedValue(undefined),
    markProcessed: vi.fn().mockResolvedValue(undefined),
    markFailed: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('@/lib/reservations/server-queries', () => ({
  ReservationServerQueries: {
    getByPayment: vi.fn().mockResolvedValue(null),
    markPaid: vi.fn().mockResolvedValue({ id: 'test-reservation-id', status: 'paid' }),
    updateStatus: vi.fn().mockResolvedValue({ id: 'test-reservation-id', status: 'paid' }),
    update: vi.fn().mockResolvedValue({ id: 'test-reservation-id', status: 'refunded' }),
  },
}));

vi.mock('@/lib/emails/async-payment-failed', () => ({
  sendAsyncPaymentFailedEmail: vi.fn().mockResolvedValue({ success: true }),
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
        webhookEvent: {
          id: 123,
          provider: 'stripe',
          event_id: mockEventId,
          event_type: 'checkout.session.completed',
          processed: false,
          processing_started_at: null,
          processed_at: null,
          processing_error: null,
          idempotency_key: `stripe:${mockPaymentIntentId}`,
          reservation_id: 'res_123',
          payload: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
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

      // Verify reservation is marked as paid with service role
      const { ReservationServerQueries } = await import('@/lib/reservations/server-queries');
      expect(ReservationServerQueries.markPaid).toHaveBeenCalledWith({
        reservationId: 'res_123',
        provider: 'stripe',
        externalPaymentId: mockPaymentIntentId,
      });

      // Verify webhook event is marked as processed (using service role)
      const { WebhookEventsServer } = await import('@/lib/webhooks/webhook-events-server');
      expect(WebhookEventsServer.markProcessed).toHaveBeenCalledWith({
        provider: 'stripe',
        eventId: mockEventId,
        idempotencyKey: `stripe:${mockPaymentIntentId}`,
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

    it('should mark existing pending reservation as paid', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { ReservationServerQueries } = await import('@/lib/reservations/server-queries');
      const { WebhookEventsServer } = await import('@/lib/webhooks/webhook-events-server');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
        webhookEvent: {
          id: 456,
          provider: 'stripe',
          event_id: mockEventId,
          event_type: 'checkout.session.completed',
          processed: false,
          processing_started_at: null,
          processed_at: null,
          processing_error: null,
          idempotency_key: `stripe:${mockPaymentIntentId}`,
          reservation_id: null,
          payload: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      // Mock existing pending reservation
      (ReservationServerQueries.getByPayment as any).mockResolvedValueOnce({
        id: 'existing-res-123',
        status: 'pending',
        puppy_id: mockPuppyId,
        customer_email: 'test@example.com',
        external_payment_id: mockPaymentIntentId,
        payment_provider: 'stripe',
      });

      (ReservationServerQueries.markPaid as any).mockResolvedValue({
        id: 'existing-res-123',
        status: 'paid',
      });

      const session = createMockSession();
      const event = createMockEvent('checkout.session.completed', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.duplicate).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.reservationId).toBe('existing-res-123');

      // Verify webhook event was created and marked as processing
      expect(idempotencyManager.createWebhookEvent).toHaveBeenCalledWith({
        provider: 'stripe',
        eventId: mockEventId,
        eventType: 'checkout.session.completed',
        idempotencyKey: `stripe:${mockPaymentIntentId}`,
        payload: expect.objectContaining({
          event_id: mockEventId,
          session_id: mockSessionId,
          payment_intent: mockPaymentIntentId,
        }),
      });

      expect(WebhookEventsServer.markProcessing).toHaveBeenCalledWith({
        provider: 'stripe',
        eventId: mockEventId,
        idempotencyKey: `stripe:${mockPaymentIntentId}`,
        eventType: 'checkout.session.completed',
      });

      // Verify existing reservation was marked as paid
      expect(ReservationServerQueries.markPaid).toHaveBeenCalledWith({
        reservationId: 'existing-res-123',
        provider: 'stripe',
        externalPaymentId: mockPaymentIntentId,
      });

      // Verify webhook event was marked as processed
      expect(WebhookEventsServer.markProcessed).toHaveBeenCalledWith({
        provider: 'stripe',
        eventId: mockEventId,
        idempotencyKey: `stripe:${mockPaymentIntentId}`,
      });
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

      expect(result.success).toBe(true);
      expect(result.skipped).toBe(true);
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

    it('should fail if reservation status update fails', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { ReservationCreationService } = await import('@/lib/reservations/create');
      const { ReservationServerQueries } = await import('@/lib/reservations/server-queries');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      (ReservationCreationService.createReservation as any).mockResolvedValue({
        reservationId: 'res_123',
      });

      // Mock markPaid failure
      (ReservationServerQueries.markPaid as any).mockResolvedValue(null);

      const session = createMockSession();
      const event = createMockEvent('checkout.session.completed', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to mark reservation as paid');
      expect(result.reservationId).toBe('res_123');

      // Verify webhook event was NOT marked as processed (since it failed)
      const { WebhookEventsServer } = await import('@/lib/webhooks/webhook-events-server');
      expect(WebhookEventsServer.markProcessed).not.toHaveBeenCalled();
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

      // Ensure markPaid succeeds
      const { ReservationServerQueries } = await import('@/lib/reservations/server-queries');
      (ReservationServerQueries.markPaid as any).mockResolvedValue({
        id: 'res_123',
        status: 'paid',
      });

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
        webhookEvent: {
          id: 456,
          provider: 'stripe',
          event_id: mockEventId,
          event_type: 'checkout.session.async_payment_succeeded',
          processed: false,
          processing_started_at: null,
          processed_at: null,
          processing_error: null,
          idempotency_key: `stripe:${mockPaymentIntentId}`,
          reservation_id: 'res_123',
          payload: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      const session = createMockSession();
      const event = createMockEvent('checkout.session.async_payment_succeeded', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('checkout.session.async_payment_succeeded');
      expect(result.reservationId).toBe('res_123');
      expect(ReservationCreationService.createReservation).toHaveBeenCalled();

      // Verify reservation is marked as paid with service role
      expect(ReservationServerQueries.markPaid).toHaveBeenCalledWith({
        reservationId: 'res_123',
        provider: 'stripe',
        externalPaymentId: mockPaymentIntentId,
      });

      // Verify webhook event is marked as processed (using service role)
      const { WebhookEventsServer } = await import('@/lib/webhooks/webhook-events-server');
      expect(WebhookEventsServer.markProcessed).toHaveBeenCalledWith({
        provider: 'stripe',
        eventId: mockEventId,
        idempotencyKey: `stripe:${mockPaymentIntentId}`,
      });
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
        webhookEvent: {
          id: 789,
          provider: 'stripe',
          event_id: mockEventId,
          event_type: 'checkout.session.async_payment_failed',
          processed: false,
          processing_started_at: null,
          processed_at: null,
          processing_error: null,
          idempotency_key: `stripe:${mockPaymentIntentId}:failed`,
          reservation_id: null,
          payload: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
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

      // Verify webhook event is marked as processed (using service role)
      const { WebhookEventsServer } = await import('@/lib/webhooks/webhook-events-server');
      expect(WebhookEventsServer.markProcessed).toHaveBeenCalledWith({
        provider: 'stripe',
        eventId: mockEventId,
        idempotencyKey: `stripe:${mockPaymentIntentId}:failed`,
      });
    });

    it('prefers customer_details over metadata when sending async failure email', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { sendAsyncPaymentFailedEmail } = await import('@/lib/emails/async-payment-failed');

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
        webhookEvent: {
          id: 790,
          provider: 'stripe',
          event_id: mockEventId,
          event_type: 'checkout.session.async_payment_failed',
          processed: false,
          processing_started_at: null,
          processed_at: null,
          processing_error: null,
          idempotency_key: `stripe:${mockPaymentIntentId}:failed`,
          reservation_id: null,
          payload: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
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
        webhookEvent: {
          id: 999,
          provider: 'stripe',
          event_id: mockEventId,
          event_type: 'checkout.session.expired',
          processed: false,
          processing_started_at: null,
          processed_at: null,
          processing_error: null,
          idempotency_key: `stripe:${mockSessionId}:expired`,
          reservation_id: null,
          payload: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      const session = createMockSession();
      const event = createMockEvent('checkout.session.expired', session);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('checkout.session.expired');
      expect(result.error).toContain('Session expired');
      expect(idempotencyManager.createWebhookEvent).toHaveBeenCalled();

      // Verify webhook event is marked as processed (using service role)
      const { WebhookEventsServer } = await import('@/lib/webhooks/webhook-events-server');
      expect(WebhookEventsServer.markProcessed).toHaveBeenCalledWith({
        provider: 'stripe',
        eventId: mockEventId,
        idempotencyKey: `stripe:${mockSessionId}:expired`,
      });
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

  describe('charge.refunded', () => {
    const mockChargeId = 'ch_test123';
    const mockRefundId = 're_test123';
    const mockReservationId = 'res_123';

    const createMockCharge = (overrides?: any) => ({
      id: mockChargeId,
      object: 'charge',
      amount: 30000, // $300.00
      amount_refunded: 30000,
      currency: 'usd',
      payment_intent: mockPaymentIntentId,
      refunds: {
        data: [
          {
            id: mockRefundId,
            amount: 30000,
            reason: 'requested_by_customer',
          },
        ],
      },
      ...overrides,
    });

    const createRefundEvent = (charge: any): Stripe.Event =>
      ({
        id: mockEventId,
        object: 'event',
        type: 'charge.refunded',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: charge,
        },
        api_version: '2023-10-16',
        livemode: false,
        pending_webhooks: 0,
        request: null,
      }) as Stripe.Event;

    beforeEach(async () => {
      vi.clearAllMocks();
      const { ReservationServerQueries } = await import('@/lib/reservations/server-queries');
      (ReservationServerQueries.getByPayment as any).mockResolvedValue({
        id: mockReservationId,
        puppy_id: mockPuppyId,
        status: 'paid',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        deposit_amount: 300,
        notes: 'Original payment',
      });
      (ReservationServerQueries.update as any).mockResolvedValue({
        id: mockReservationId,
        status: 'refunded',
      });
    });

    it('should successfully process refund event', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { ReservationServerQueries } = await import('@/lib/reservations/server-queries');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
        webhookEvent: {
          id: 888,
          provider: 'stripe',
          event_id: mockEventId,
          event_type: 'charge.refunded',
          processed: false,
          processing_started_at: null,
          processed_at: null,
          processing_error: null,
          idempotency_key: `stripe:${mockPaymentIntentId}:refunded`,
          reservation_id: mockReservationId,
          payload: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      const charge = createMockCharge();
      const event = createRefundEvent(charge);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(true);
      expect(result.eventType).toBe('charge.refunded');
      expect(result.paymentIntentId).toBe(mockPaymentIntentId);
      expect(result.reservationId).toBe(mockReservationId);

      // Verify reservation was found by payment intent using service role
      expect(ReservationServerQueries.getByPayment).toHaveBeenCalledWith(
        'stripe',
        mockPaymentIntentId,
      );

      // Verify status was updated to refunded using service role
      expect(ReservationServerQueries.update).toHaveBeenCalledWith(
        mockReservationId,
        expect.objectContaining({
          status: 'refunded',
          notes: expect.stringContaining('Stripe Refund'),
        }),
      );

      // Verify webhook event is marked as processed (using service role)
      const { WebhookEventsServer } = await import('@/lib/webhooks/webhook-events-server');
      expect(WebhookEventsServer.markProcessed).toHaveBeenCalledWith({
        provider: 'stripe',
        eventId: mockEventId,
        idempotencyKey: `stripe:${mockPaymentIntentId}:refunded`,
      });
    });

    it('should handle missing payment intent', async () => {
      const charge = createMockCharge({ payment_intent: null });
      const event = createRefundEvent(charge);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing payment_intent');
    });

    it('should handle reservation not found', async () => {
      const { ReservationServerQueries } = await import('@/lib/reservations/server-queries');
      (ReservationServerQueries.getByPayment as any).mockResolvedValue(null);

      const charge = createMockCharge();
      const event = createRefundEvent(charge);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Reservation not found');
    });

    it('should handle reservation update failure', async () => {
      const { ReservationServerQueries } = await import('@/lib/reservations/server-queries');
      (ReservationServerQueries.update as any).mockRejectedValue(new Error('Database error'));

      const charge = createMockCharge();
      const event = createRefundEvent(charge);

      const result = await StripeWebhookHandler.processEvent(event);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update reservation status');
    });

    it('should include refund details in notes', async () => {
      const { idempotencyManager } = await import('@/lib/reservations/idempotency');
      const { ReservationServerQueries } = await import('@/lib/reservations/server-queries');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: mockPaymentIntentId,
        provider: 'stripe',
      });

      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
        webhookEvent: {
          id: 889,
          provider: 'stripe',
          event_id: mockEventId,
          event_type: 'charge.refunded',
          processed: false,
          processing_started_at: null,
          processed_at: null,
          processing_error: null,
          idempotency_key: `stripe:${mockPaymentIntentId}:refunded`,
          reservation_id: mockReservationId,
          payload: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      const charge = createMockCharge();
      const event = createRefundEvent(charge);

      await StripeWebhookHandler.processEvent(event);

      expect(ReservationServerQueries.update).toHaveBeenCalledWith(
        mockReservationId,
        expect.objectContaining({
          notes: expect.stringMatching(/Amount: \$300.*USD/),
        }),
      );

      expect(ReservationServerQueries.update).toHaveBeenCalledWith(
        mockReservationId,
        expect.objectContaining({
          notes: expect.stringMatching(/Reason: requested_by_customer/),
        }),
      );

      expect(ReservationServerQueries.update).toHaveBeenCalledWith(
        mockReservationId,
        expect.objectContaining({
          notes: expect.stringMatching(/Refund ID: re_test123/),
        }),
      );
    });
  });
});
