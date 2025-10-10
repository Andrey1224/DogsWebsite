/**
 * Reservation Creation Service Tests
 *
 * Tests for atomic reservation creation and race condition handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReservationCreationService } from './create';
import type { CreateReservationParams } from './types';

// Mock modules
const mockSupabaseFrom = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
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

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock chain
    mockSupabaseFrom.mockReturnValue({
      update: mockUpdate,
    });
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
      select: mockSelect,
      update: mockUpdate,
    });
    mockSelect.mockReturnValue({
      single: mockSingle,
    });
  });

  describe('Atomic Puppy Reservation', () => {
    it('should atomically reserve puppy by updating status from available to reserved', async () => {
      const { idempotencyManager } = await import('./idempotency');
      const { ReservationQueries } = await import('./queries');

      // Setup successful puppy reservation
      mockSingle.mockResolvedValue({
        data: {
          id: validParams.puppyId,
          price: 2500,
          name: 'Test Puppy',
          status: 'reserved',
        },
        error: null,
      });

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });

      (ReservationQueries.create as any).mockResolvedValue({
        id: 'reservation-123',
        puppy_id: validParams.puppyId,
        customer_email: validParams.customerEmail,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const result = await ReservationCreationService.createReservation(validParams);

      expect(result.success).toBe(true);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('puppies');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'reserved' });
      expect(mockEq).toHaveBeenCalledWith('id', validParams.puppyId);
      expect(mockEq).toHaveBeenCalledWith('status', 'available');
    });

    it('should return RACE_CONDITION_LOST when puppy is no longer available', async () => {
      const { idempotencyManager } = await import('./idempotency');

      // Puppy not available (atomic update returns no data)
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'No rows returned' },
      });

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });

      const result = await ReservationCreationService.createReservation(validParams);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('RACE_CONDITION_LOST');
      expect(result.error).toContain('no longer available');
    });

    it('should rollback puppy status on reservation creation failure', async () => {
      const { idempotencyManager } = await import('./idempotency');
      const { ReservationQueries } = await import('./queries');

      // First call: successfully reserve puppy
      mockSingle.mockResolvedValueOnce({
        data: {
          id: validParams.puppyId,
          price: 2500,
          name: 'Test Puppy',
          status: 'reserved',
        },
        error: null,
      });

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });

      // Mock reservation creation to fail
      (ReservationQueries.create as any).mockRejectedValue(new Error('Database error'));

      const result = await ReservationCreationService.createReservation(validParams);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('DATABASE_ERROR');

      // Verify rollback was attempted (update called twice: reserve + rollback)
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'available' });
    });

    it('should handle deposit amount exceeding puppy price with rollback', async () => {
      const { idempotencyManager } = await import('./idempotency');

      mockSingle.mockResolvedValueOnce({
        data: {
          id: validParams.puppyId,
          price: 100, // Lower than deposit amount (500)
          name: 'Test Puppy',
          status: 'reserved',
        },
        error: null,
      });

      (idempotencyManager.checkWebhookEvent as any).mockResolvedValue({
        exists: false,
        paymentId: validParams.externalPaymentId,
        provider: validParams.paymentProvider,
      });

      const result = await ReservationCreationService.createReservation(validParams);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('VALIDATION_ERROR');
      expect(result.error).toContain('cannot exceed puppy price');

      // Verify rollback was attempted
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'available' });
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

      const result = await ReservationCreationService.createReservation(validParams);

      expect(result.success).toBe(true);
      expect(result.reservation).toEqual(existingReservation);
      expect(result.error).toContain('already exists');
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid email format', async () => {
      const invalidParams = {
        ...validParams,
        customerEmail: 'invalid-email',
      };

      const result = await ReservationCreationService.createReservation(invalidParams);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('VALIDATION_ERROR');
      expect(result.error).toContain('Validation error');
    });

    it('should reject invalid Stripe payment ID format', async () => {
      const invalidParams = {
        ...validParams,
        paymentProvider: 'stripe' as const,
        externalPaymentId: 'invalid-format',
      };

      const result = await ReservationCreationService.createReservation(invalidParams);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('VALIDATION_ERROR');
      expect(result.error).toContain('Invalid payment ID format');
    });
  });
});
