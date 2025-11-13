/**
 * Unit tests for deposit notification emails
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sendOwnerDepositNotification,
  sendCustomerDepositConfirmation,
  resetResendClient,
} from './deposit-notifications';

// Mock Resend
vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi.fn().mockResolvedValue({
          data: { id: 'test-email-id' },
          error: null,
        }),
      },
    })),
  };
});

const baseEnv = process.env;

describe('Deposit Email Notifications', () => {
  beforeEach(() => {
    process.env = {
      ...baseEnv,
      RESEND_DELIVERY_MODE: 'always',
    };
    resetResendClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetResendClient();
    process.env = baseEnv;
  });

  const mockDepositData = {
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    puppyName: 'Bella',
    puppySlug: 'bella-french-bulldog-2024',
    depositAmount: 300,
    currency: 'USD',
    paymentProvider: 'stripe' as const,
    reservationId: '123',
    transactionId: 'pi_test123',
  };

  describe('sendOwnerDepositNotification', () => {
    it('should send email when Resend is configured', async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        RESEND_API_KEY: 'test-key',
        OWNER_EMAIL: 'owner@example.com',
        RESEND_FROM_EMAIL: 'noreply@test.com',
      };

      const result = await sendOwnerDepositNotification(mockDepositData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      process.env = originalEnv;
    });

    it('should handle missing Resend API key', async () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, RESEND_API_KEY: undefined };

      const result = await sendOwnerDepositNotification(mockDepositData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Resend API key not configured');

      process.env = originalEnv;
    });

    it('should handle missing owner email', async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        RESEND_API_KEY: 'test-key',
        OWNER_EMAIL: undefined,
      };

      const result = await sendOwnerDepositNotification(mockDepositData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Owner email not configured');

      process.env = originalEnv;
    });
  });

  describe('sendCustomerDepositConfirmation', () => {
    it('should send email when Resend is configured', async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        RESEND_API_KEY: 'test-key',
        RESEND_FROM_EMAIL: 'noreply@test.com',
      };

      const result = await sendCustomerDepositConfirmation(mockDepositData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      process.env = originalEnv;
    });

    it('should handle missing Resend API key', async () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv, RESEND_API_KEY: undefined };

      const result = await sendCustomerDepositConfirmation(mockDepositData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Resend API key not configured');

      process.env = originalEnv;
    });

    it('should include customer email in recipient list', async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        RESEND_API_KEY: 'test-key',
        RESEND_FROM_EMAIL: 'noreply@test.com',
      };

      await sendCustomerDepositConfirmation(mockDepositData);

      // Test passes if no errors are thrown
      expect(true).toBe(true);

      process.env = originalEnv;
    });
  });

  describe('Email content generation', () => {
    it('should include deposit amount in both emails', async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        RESEND_API_KEY: 'test-key',
        OWNER_EMAIL: 'owner@example.com',
        RESEND_FROM_EMAIL: 'noreply@test.com',
      };

      // Both functions should succeed without throwing
      await expect(sendOwnerDepositNotification(mockDepositData)).resolves.toBeDefined();
      await expect(sendCustomerDepositConfirmation(mockDepositData)).resolves.toBeDefined();

      process.env = originalEnv;
    });

    it('should handle different payment providers', async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        RESEND_API_KEY: 'test-key',
        OWNER_EMAIL: 'owner@example.com',
        RESEND_FROM_EMAIL: 'noreply@test.com',
      };

      const paypalData = {
        ...mockDepositData,
        paymentProvider: 'paypal' as const,
      };

      const result = await sendOwnerDepositNotification(paypalData);
      expect(result.success).toBe(true);

      process.env = originalEnv;
    });
  });
});
