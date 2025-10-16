import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const BASE_ENV = { ...process.env };

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('PayPal Client', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, BASE_ENV);
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Configuration Guards', () => {
    it('throws error when PAYPAL_CLIENT_ID is missing', async () => {
      delete process.env.PAYPAL_CLIENT_ID;
      delete process.env.PAYPAL_CLIENT_SECRET;
      process.env.PAYPAL_ENV = 'sandbox';

      const { getPayPalEnvironment } = await import('./client');

      expect(() => getPayPalEnvironment()).toThrow('PayPal client credentials are not configured');
    });

    it('throws error when PAYPAL_CLIENT_SECRET is missing', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      delete process.env.PAYPAL_CLIENT_SECRET;
      process.env.PAYPAL_ENV = 'sandbox';

      const { getPayPalEnvironment } = await import('./client');

      expect(() => getPayPalEnvironment()).toThrow('PayPal client credentials are not configured');
    });

    it('throws error for invalid PAYPAL_ENV value', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'invalid';

      const { getPayPalEnvironment } = await import('./client');

      expect(() => getPayPalEnvironment()).toThrow('Invalid PAYPAL_ENV value: invalid');
    });

    it('defaults to sandbox environment when PAYPAL_ENV is not set', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      delete process.env.PAYPAL_ENV;

      const { getPayPalEnvironment } = await import('./client');

      expect(getPayPalEnvironment()).toBe('sandbox');
    });

    it('returns sandbox environment when explicitly set', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'sandbox';

      const { getPayPalEnvironment } = await import('./client');

      expect(getPayPalEnvironment()).toBe('sandbox');
    });

    it('returns live environment when explicitly set', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'live';

      const { getPayPalEnvironment } = await import('./client');

      expect(getPayPalEnvironment()).toBe('live');
    });
  });

  describe('API Base URL', () => {
    it('returns sandbox URL for sandbox environment', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'sandbox';

      const { getPayPalApiBaseUrl } = await import('./client');

      expect(getPayPalApiBaseUrl()).toBe('https://api-m.sandbox.paypal.com');
    });

    it('returns live URL for live environment', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'live';

      const { getPayPalApiBaseUrl } = await import('./client');

      expect(getPayPalApiBaseUrl()).toBe('https://api-m.paypal.com');
    });
  });

  describe('Access Token Management', () => {
    it('successfully obtains access token', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'sandbox';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test_access_token_123',
          expires_in: 3600,
        }),
      });

      const { getPayPalAccessToken } = await import('./client');
      const token = await getPayPalAccessToken();

      expect(token).toBe('test_access_token_123');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-m.sandbox.paypal.com/v1/oauth2/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        })
      );
    });

    it('caches access token and reuses it', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'sandbox';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'cached_token',
          expires_in: 3600,
        }),
      });

      const { getPayPalAccessToken } = await import('./client');

      // First call
      const token1 = await getPayPalAccessToken();
      expect(token1).toBe('cached_token');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const token2 = await getPayPalAccessToken();
      expect(token2).toBe('cached_token');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('forces token refresh when requested', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'sandbox';

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'first_token',
            expires_in: 3600,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'second_token',
            expires_in: 3600,
          }),
        });

      const { getPayPalAccessToken, clearPayPalAccessTokenCache } = await import('./client');

      const token1 = await getPayPalAccessToken();
      expect(token1).toBe('first_token');

      clearPayPalAccessTokenCache();

      const token2 = await getPayPalAccessToken();
      expect(token2).toBe('second_token');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('throws error when access token request fails', async () => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'sandbox';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid credentials',
      });

      const { getPayPalAccessToken } = await import('./client');

      await expect(getPayPalAccessToken()).rejects.toThrow(
        'Failed to obtain PayPal access token (401 Unauthorized): Invalid credentials'
      );
    });
  });

  describe('Order Creation', () => {
    beforeEach(() => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'sandbox';
    });

    it('creates order with correct parameters', async () => {
      // Mock access token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test_token',
          expires_in: 3600,
        }),
      });

      // Mock order creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'ORDER_123',
          status: 'CREATED',
        }),
      });

      const { createPayPalOrder } = await import('./client');

      const order = await createPayPalOrder({
        amount: 500,
        description: 'Puppy Deposit',
        metadata: {
          puppy_id: 'puppy_123',
          customer_email: 'test@example.com',
          customer_name: 'Test User',
        },
      });

      expect(order).toEqual({
        id: 'ORDER_123',
        status: 'CREATED',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-m.sandbox.paypal.com/v2/checkout/orders',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('500.00'),
        })
      );
    });

    it('throws error when metadata exceeds 127 characters', async () => {
      // Mock access token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test_token',
          expires_in: 3600,
        }),
      });

      const { createPayPalOrder } = await import('./client');

      const longString = 'a'.repeat(100);

      await expect(
        createPayPalOrder({
          amount: 500,
          description: 'Test',
          metadata: {
            puppy_id: longString,
            customer_email: 'test@example.com',
            customer_name: 'Test User',
          },
        })
      ).rejects.toThrow('PayPal custom_id exceeds 127 character limit');
    });

    it('handles API errors gracefully', async () => {
      // Mock access token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test_token',
          expires_in: 3600,
        }),
      });

      // Mock failed order creation
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid amount',
      });

      const { createPayPalOrder } = await import('./client');

      await expect(
        createPayPalOrder({
          amount: 500,
          description: 'Test',
          metadata: {
            puppy_id: 'puppy_123',
            customer_email: 'test@example.com',
            customer_name: 'Test User',
          },
        })
      ).rejects.toThrow('PayPal API request failed (400 Bad Request): Invalid amount');
    });
  });

  describe('Order Capture', () => {
    beforeEach(() => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'sandbox';
    });

    it('captures order successfully', async () => {
      // Mock access token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test_token',
          expires_in: 3600,
        }),
      });

      // Mock order capture
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'ORDER_123',
          status: 'COMPLETED',
        }),
      });

      const { capturePayPalOrder } = await import('./client');

      const result = await capturePayPalOrder({
        orderId: 'ORDER_123',
      });

      expect(result).toEqual({
        id: 'ORDER_123',
        status: 'COMPLETED',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER_123/capture',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('Get Order', () => {
    beforeEach(() => {
      process.env.PAYPAL_CLIENT_ID = 'test_client_id';
      process.env.PAYPAL_CLIENT_SECRET = 'test_secret';
      process.env.PAYPAL_ENV = 'sandbox';
    });

    it('retrieves order details', async () => {
      // Mock access token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test_token',
          expires_in: 3600,
        }),
      });

      // Mock get order
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'ORDER_123',
          status: 'APPROVED',
        }),
      });

      const { getPayPalOrder } = await import('./client');

      const order = await getPayPalOrder('ORDER_123');

      expect(order).toEqual({
        id: 'ORDER_123',
        status: 'APPROVED',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER_123',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });
});
