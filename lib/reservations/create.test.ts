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

vi.mock('./queries', () => ({
  ReservationQueries: {
    create: vi.fn(),
  },
  WebhookEventQueries: {
    update: vi.fn(),
  },
}));

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

  beforeEach(() => {
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
});
