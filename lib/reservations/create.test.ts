/**
 * Reservation Creation Service Tests
 *
 * Tests for atomic reservation creation and race condition handling
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReservationCreationError, ReservationCreationService } from './create';
import type { CreateReservationParams } from './types';
import type { SupabaseFixture } from '../../tests/fixtures/supabase-client-fixture';

const supabaseFixture =
  (globalThis as { __SUPABASE_FIXTURE__?: SupabaseFixture })
    .__SUPABASE_FIXTURE__;

vi.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: () => supabaseFixture,
}));

vi.mock('./queries', () => {
  const reservationQueries = {
    create: vi.fn(),
    getByPayment: vi.fn(),
    getById: vi.fn(),
    updateStatus: vi.fn(),
    expireOldPending: vi.fn(),
  };
  const webhookEventQueries = {
    update: vi.fn(),
    create: vi.fn(),
    markAsProcessed: vi.fn(),
    markAsFailed: vi.fn(),
  };

  return {
    ReservationQueries: reservationQueries,
    WebhookEventQueries: webhookEventQueries,
    TransactionQueries: {
      createReservationWithWebhook: vi.fn(),
    },
  };
});

vi.mock('./idempotency', () => ({
  idempotencyManager: {
    checkWebhookEvent: vi.fn(),
    createWebhookEvent: vi.fn(),
  },
}));

describe('ReservationCreationService', () => {
  const validParams: CreateReservationParams = {
    puppyId: '123e4567-e89b-12d3-a456-426614174000',
    customerEmail: 'test@example.com',
    customerName: 'Test Customer',
    depositAmount: 500,
    paymentProvider: 'stripe',
    externalPaymentId: 'pi_test123',
    channel: 'site',
  };

  if (!supabaseFixture) {
    throw new Error('Supabase fixture not initialized');
  }

  beforeEach(async () => {
    const { ReservationQueries, WebhookEventQueries, TransactionQueries } = await import('./queries');
    Object.values(ReservationQueries).forEach((mockFn) => mockFn.mockReset());
    Object.values(WebhookEventQueries).forEach((mockFn) => mockFn.mockReset());
    Object.values(TransactionQueries).forEach((mockFn) => mockFn.mockReset?.());
    supabaseFixture.reset();
  });

  const registerReservationTransaction = (
    impl: (args: Record<string, unknown>) => Promise<{
      data: unknown;
      error: { message: string } | null;
    }>,
  ) => {
    const handler = vi.fn(impl);
    supabaseFixture.registerRpc(
      'create_reservation_transaction',
      handler as Parameters<SupabaseFixture['registerRpc']>[1],
    );
    return handler;
  };

  describe('Atomic Puppy Reservation', () => {
    it('should atomically reserve puppy by updating status from available to reserved', async () => {
      const { idempotencyManager } = await import('./idempotency');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });

      const reservationRecord = {
        id: 'reservation-123',
        puppy_id: validParams.puppyId,
        customer_email: validParams.customerEmail,
        status: 'pending',
        deposit_amount: validParams.depositAmount,
        amount: validParams.depositAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const rpcHandler = registerReservationTransaction(async () => ({
        data: reservationRecord,
        error: null,
      }));

      const { reservationId } = await ReservationCreationService.createReservation(validParams);

      expect(reservationId).toBe(reservationRecord.id);
      expect(rpcHandler).toHaveBeenCalledWith({
        p_amount: validParams.depositAmount,
        p_channel: validParams.channel,
        p_customer_email: validParams.customerEmail,
        p_customer_name: validParams.customerName,
        p_customer_phone: null,
        p_deposit_amount: validParams.depositAmount,
        p_expires_at: expect.any(String),
        p_external_payment_id: validParams.externalPaymentId,
        p_notes: null,
        p_payment_provider: validParams.paymentProvider,
        p_puppy_id: validParams.puppyId,
      });
    });

    it('should return RACE_CONDITION_LOST when puppy is no longer available', async () => {
      const { idempotencyManager } = await import('./idempotency');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });

      registerReservationTransaction(async () => ({
        data: null,
        error: { message: 'PUPPY_NOT_AVAILABLE' },
      }));

      await ReservationCreationService.createReservation(validParams)
        .then(() => {
          throw new Error('Expected reservation creation to fail');
        })
        .catch((error) => {
          expect(error).toBeInstanceOf(ReservationCreationError);
          expect(error.code).toBe('RACE_CONDITION_LOST');
          expect(error.message.toLowerCase()).toContain('no longer available');
        });
    });

    it('should rollback puppy status on reservation creation failure', async () => {
      const { idempotencyManager } = await import('./idempotency');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });

      const rpcHandler = registerReservationTransaction(async () => ({
        data: null,
        error: { message: 'Database error' },
      }));

      await expect(
        ReservationCreationService.createReservation(validParams)
      ).rejects.toMatchObject({
        code: 'DATABASE_ERROR',
        message: expect.any(String),
      });
      expect(rpcHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle deposit amount exceeding puppy price with rollback', async () => {
      const { idempotencyManager } = await import('./idempotency');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });

      const rpcHandler = registerReservationTransaction(async () => ({
        data: null,
        error: { message: 'DEPOSIT_EXCEEDS_PRICE' },
      }));

      await expect(
        ReservationCreationService.createReservation(validParams)
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining('cannot exceed puppy price'),
      });
      expect(rpcHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Idempotency', () => {
    it('should return existing reservation for duplicate payment', async () => {
      const { idempotencyManager } = await import('./idempotency');

      const existingReservation = {
        id: 'existing-123',
        puppy_id: validParams.puppyId,
        customer_email: validParams.customerEmail,
        customer_name: validParams.customerName || null,
        customer_phone: null,
        channel: null,
        status: 'paid' as const,
        deposit_amount: validParams.depositAmount,
        amount: validParams.depositAmount,
        payment_provider: validParams.paymentProvider,
        external_payment_id: validParams.externalPaymentId,
        webhook_event_id: null,
        expires_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: true,
        reservation: existingReservation,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });

      const { reservationId } = await ReservationCreationService.createReservation(validParams);

      expect(reservationId).toBe(existingReservation.id);
    });

    it('should reuse existing reservation after initial creation', async () => {
      const { idempotencyManager } = await import('./idempotency');
      const { ReservationQueries } = await import('./queries');

      (idempotencyManager.checkWebhookEvent as any)
        .mockResolvedValueOnce({
          exists: false,
          paymentId: validParams.externalPaymentId,
          provider: validParams.paymentProvider,
        })
        .mockResolvedValueOnce({
          exists: true,
          paymentId: validParams.externalPaymentId,
          provider: validParams.paymentProvider,
        });

      ReservationQueries.getByPayment.mockResolvedValue({
        id: 'reservation-dup',
      });

      const rpcHandler = registerReservationTransaction(async () => ({
        data: { id: 'reservation-dup' },
        error: null,
      }));

      await ReservationCreationService.createReservation(validParams);
      const result = await ReservationCreationService.createReservation(validParams);

      expect(result).toEqual({ reservationId: 'reservation-dup' });
      expect(rpcHandler).toHaveBeenCalledTimes(1);
      expect(ReservationQueries.getByPayment).toHaveBeenCalledWith(
        validParams.paymentProvider,
        validParams.externalPaymentId,
      );
    });
  });

  describe('Webhook events', () => {
    it('links reservation to webhook event when provided', async () => {
      const { idempotencyManager } = await import('./idempotency');
      const { WebhookEventQueries } = await import('./queries');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });
      (idempotencyManager.createWebhookEvent as any).mockResolvedValue({
        success: true,
        webhookEvent: { id: 99 },
      });

      registerReservationTransaction(async () => ({
        data: { reservation_id: 'reservation-webhook' },
        error: null,
      }));

      await ReservationCreationService.createReservation(validParams, {
        provider: validParams.paymentProvider,
        eventId: 'evt_webhook_1',
        eventType: 'checkout.session.completed',
        payload: { id: 'evt_webhook_1' },
      });

      expect(WebhookEventQueries.update).toHaveBeenCalledWith(99, {
        reservation_id: 'reservation-webhook',
      });
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid email format', async () => {
      const invalidParams = {
        ...validParams,
        customerEmail: 'invalid-email',
      };

      await expect(
        ReservationCreationService.createReservation(invalidParams)
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining('Validation error'),
      });
    });

    it('should reject invalid Stripe payment ID format', async () => {
      const invalidParams = {
        ...validParams,
        paymentProvider: 'stripe' as const,
        externalPaymentId: 'invalid-format',
      };

      await expect(
        ReservationCreationService.createReservation(invalidParams)
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining('Invalid payment ID format'),
      });
    });
  });

  describe('createWithConfirmedPayment', () => {
    it('should mark reservation as paid when payment matches deposit', async () => {
      const { idempotencyManager } = await import('./idempotency');
      const { ReservationQueries } = await import('./queries');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });

      ReservationQueries.updateStatus.mockResolvedValue(null);

      registerReservationTransaction(async () => ({
        data: { reservation_id: 'paid-reservation' },
        error: null,
      }));

      const result = await ReservationCreationService.createWithConfirmedPayment(
        validParams,
        validParams.depositAmount,
      );

      expect(result).toEqual({ reservationId: 'paid-reservation' });
      expect(ReservationQueries.updateStatus).toHaveBeenCalledWith(
        'paid-reservation',
        'paid',
      );
    });

    it('should leave status unchanged when payment amount differs', async () => {
      const { idempotencyManager } = await import('./idempotency');
      const { ReservationQueries } = await import('./queries');

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });

      registerReservationTransaction(async () => ({
        data: { reservation_id: 'pending-reservation' },
        error: null,
      }));

      await ReservationCreationService.createWithConfirmedPayment(
        validParams,
        validParams.depositAmount + 100,
      );

      expect(ReservationQueries.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('createFromPayment', () => {
    it('delegates to createReservation with derived params', async () => {
      const createSpy = vi
        .spyOn(ReservationCreationService, 'createReservation')
        .mockResolvedValue({ reservationId: 'from-payment' });

      const result = await ReservationCreationService.createFromPayment(
        'stripe',
        'pi_123',
        'puppy_123',
        'user@example.com',
        'Jane',
        '+12055551234',
        750,
      );

      expect(result).toEqual({ reservationId: 'from-payment' });
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          puppyId: 'puppy_123',
          customerEmail: 'user@example.com',
          depositAmount: 750,
        }),
        undefined,
      );

      createSpy.mockRestore();
    });
  });

  describe('Utilities', () => {
    it('generates confirmation payloads with formatted values', () => {
      const reservation = {
        id: 'res_1',
        puppy_id: 'puppy_1',
        customer_name: 'Sam',
        customer_email: 'sam@example.com',
        deposit_amount: 500,
        payment_provider: 'stripe',
        status: 'pending',
        expires_at: '2024-01-01T12:00:00Z',
        created_at: '2024-01-01T09:00:00Z',
        amount: 500,
        customer_phone: null,
        channel: 'site',
        external_payment_id: 'pi_123',
        webhook_event_id: null,
        notes: null,
        updated_at: '2024-01-01T09:00:00Z',
      } as const;

      const payload = ReservationCreationService.generateConfirmationData(reservation, {
        name: 'Duke',
        breed_id: 'french-bulldog',
        price: 3000,
        gender: 'male',
        birth_date: '2023-09-15',
      });

      expect(payload).toMatchObject({
        reservationId: 'res_1',
        puppyName: 'Duke',
        depositAmount: '$500.00',
        puppyDetails: expect.objectContaining({
          price: '$3,000.00',
        }),
      });
    });

    it('expires pending reservations when past due', async () => {
      const { ReservationQueries } = await import('./queries');
      const now = new Date();
      const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000);

      ReservationQueries.getById.mockResolvedValue({
        id: 'res_expire',
        status: 'pending',
        expires_at: yesterday.toISOString(),
      });
      ReservationQueries.updateStatus.mockResolvedValue({ id: 'res_expire', status: 'expired' });

      const result = await ReservationCreationService.processExpiration('res_expire');

      expect(result).toBe(true);
      expect(ReservationQueries.updateStatus).toHaveBeenCalledWith('res_expire', 'expired');
    });

    it('returns false when reservation is still valid', async () => {
      const { ReservationQueries } = await import('./queries');
      const future = new Date();
      future.setHours(future.getHours() + 1);

      ReservationQueries.getById.mockResolvedValue({
        id: 'res_pending',
        status: 'pending',
        expires_at: future.toISOString(),
      });

      const shouldExpire = await ReservationCreationService.processExpiration('res_pending');
      expect(shouldExpire).toBe(false);
    });

  it('bulk expires pending reservations via query helper', async () => {
      const { ReservationQueries } = await import('./queries');
      ReservationQueries.expireOldPending.mockResolvedValue(3);

      const total = await ReservationCreationService.bulkExpirePending();
      expect(total).toBe(3);
      expect(ReservationQueries.expireOldPending).toHaveBeenCalled();
    });
  });
});
