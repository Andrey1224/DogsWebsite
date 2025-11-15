import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sendOwnerNotification,
  resetResendClient as resetOwnerClient,
} from './emails/owner-notification';
import {
  sendCustomerConfirmation,
  resetResendClient as resetCustomerClient,
} from './emails/customer-confirmation';

// Mock Resend module
const mockSend = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

// Mock environment variables
const originalEnv = process.env;

describe('Email Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({
      data: { id: 'test-email-id' },
      error: null,
    });

    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test-api-key',
      RESEND_FROM_EMAIL: 'test@example.com',
      OWNER_EMAIL: 'owner@example.com',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      RESEND_DELIVERY_MODE: 'always',
    };

    // Reset cached clients
    resetOwnerClient();
    resetCustomerClient();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('sendOwnerNotification', () => {
    it('should send owner notification with correct parameters', async () => {
      const inquiry = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        message: "I'm interested in a puppy",
        puppy_id: 'puppy-123',
        puppy_slug: 'max-puppy',
        created_at: '2025-01-15T10:00:00Z',
        source: 'form',
      };

      await sendOwnerNotification({ inquiry });

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: ['owner@example.com'],
        subject: '🐾 New Inquiry: John Doe - Exotic Bulldog Legacy',
        replyTo: 'john@example.com',
        html: expect.any(String),
      });
    });

    it('should handle missing optional fields gracefully', async () => {
      const inquiry = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        message: 'Looking for a puppy',
        created_at: '2025-01-15T10:00:00Z',
        source: 'form',
      };

      await sendOwnerNotification({ inquiry });

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: ['owner@example.com'],
        subject: '🐾 New Inquiry: Jane Doe - Exotic Bulldog Legacy',
        replyTo: 'jane@example.com',
        html: expect.any(String),
      });
    });

    it('should handle Resend API errors', async () => {
      mockSend.mockResolvedValue({
        data: null,
        error: { message: 'API Error' },
      });

      const inquiry = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
        created_at: '2025-01-15T10:00:00Z',
        source: 'form',
      };

      await expect(sendOwnerNotification({ inquiry })).rejects.toThrow();
    });
  });

  describe('sendCustomerConfirmation', () => {
    it('should send customer confirmation with correct parameters', async () => {
      await sendCustomerConfirmation({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(mockSend).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: ['john@example.com'],
        subject: "Your Exotic Bulldog Legacy Inquiry - We'll Be in Touch Soon! 🐾",
        html: expect.any(String),
      });
    });

    it('should handle missing environment variables gracefully', async () => {
      // Remove optional environment variables
      delete process.env.RESEND_FROM_EMAIL;

      // Reset client to pick up new env
      resetCustomerClient();

      await sendCustomerConfirmation({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });

      expect(mockSend).toHaveBeenCalledWith({
        from: 'onboarding@resend.dev',
        to: ['jane@example.com'],
        subject: "Your Exotic Bulldog Legacy Inquiry - We'll Be in Touch Soon! 🐾",
        html: expect.any(String),
      });
    });
  });
});
