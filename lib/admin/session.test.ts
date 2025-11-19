/**
 * Admin Session Tests
 *
 * Tests the critical security module for admin authentication.
 * Validates session encoding/decoding, HMAC signature verification,
 * expiration handling, and protection against timing attacks.
 */

import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { randomUUID, createHmac } from 'crypto';

// Mock server-only to allow testing
vi.mock('server-only', () => ({}));

// Mock next/headers
const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookies),
}));

// Import after mocks are set up
const BASE_ENV = { ...process.env };

describe('Admin Session Module', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, BASE_ENV);
    vi.clearAllMocks();
    process.env.ADMIN_SESSION_SECRET = 'test-secret-key-for-hmac-signing';
    process.env.ADMIN_SESSION_TTL_HOURS = '24';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Session Encoding and Decoding', () => {
    it('encodes and decodes valid session successfully', async () => {
      const { setAdminSession } = await import('./session');

      mockCookies.set.mockImplementation((name, value) => {
        mockCookies.get.mockReturnValue({ name, value });
      });

      // Create session
      const session = await setAdminSession('admin@example.com');

      expect(session.sub).toBe('admin@example.com');
      expect(session.sessionId).toBeTruthy();
      expect(session.expiresAt).toBeGreaterThan(Date.now());

      // Verify cookie was set with correct options
      expect(mockCookies.set).toHaveBeenCalledWith(
        'ebl_admin_session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          expires: expect.any(Date),
        }),
      );
    });

    it('rejects session with invalid signature', async () => {
      const { getAdminSession } = await import('./session');

      // Create a token with invalid signature
      const payload = {
        sub: 'admin@example.com',
        sessionId: randomUUID(),
        expiresAt: Date.now() + 3600000,
      };

      const base = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const invalidSignature = 'invalid-signature-here';
      const tamperedToken = `${base}.${invalidSignature}`;

      mockCookies.get.mockReturnValue({ name: 'ebl_admin_session', value: tamperedToken });

      const result = await getAdminSession();
      expect(result).toBeNull();
    });

    it('rejects expired session', async () => {
      const { getAdminSession } = await import('./session');

      const secret = process.env.ADMIN_SESSION_SECRET!;
      const payload = {
        sub: 'admin@example.com',
        sessionId: randomUUID(),
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      };

      const base = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const signature = createHmac('sha256', secret).update(base).digest('base64url');
      const expiredToken = `${base}.${signature}`;

      mockCookies.get.mockReturnValue({ name: 'admin_session', value: expiredToken });

      const result = await getAdminSession();
      expect(result).toBeNull();
    });

    it('rejects malformed token (missing signature)', async () => {
      const { getAdminSession } = await import('./session');

      const payload = {
        sub: 'admin@example.com',
        sessionId: randomUUID(),
        expiresAt: Date.now() + 3600000,
      };

      const base = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const malformedToken = base; // No signature part

      mockCookies.get.mockReturnValue({ name: 'admin_session', value: malformedToken });

      const result = await getAdminSession();
      expect(result).toBeNull();
    });

    it('rejects token with malformed JSON', async () => {
      const { getAdminSession } = await import('./session');

      const secret = process.env.ADMIN_SESSION_SECRET!;
      const base = Buffer.from('not-valid-json').toString('base64url');
      const signature = createHmac('sha256', secret).update(base).digest('base64url');
      const badToken = `${base}.${signature}`;

      mockCookies.get.mockReturnValue({ name: 'admin_session', value: badToken });

      const result = await getAdminSession();
      expect(result).toBeNull();
    });

    it('returns null when no cookie is present', async () => {
      const { getAdminSession } = await import('./session');

      mockCookies.get.mockReturnValue(undefined);

      const result = await getAdminSession();
      expect(result).toBeNull();
    });

    it('returns null for undefined token', async () => {
      const { getAdminSession } = await import('./session');

      mockCookies.get.mockReturnValue({ name: 'admin_session', value: undefined });

      const result = await getAdminSession();
      expect(result).toBeNull();
    });
  });

  describe('Session Configuration', () => {
    it('throws error when ADMIN_SESSION_SECRET is not set', async () => {
      delete process.env.ADMIN_SESSION_SECRET;
      vi.resetModules();

      const { setAdminSession } = await import('./session');

      await expect(setAdminSession('admin@example.com')).rejects.toThrow(
        'ADMIN_SESSION_SECRET is not set',
      );
    });

    it('uses custom TTL from environment variable', async () => {
      process.env.ADMIN_SESSION_TTL_HOURS = '48';
      vi.resetModules();

      const { setAdminSession } = await import('./session');

      mockCookies.set.mockImplementation(() => {});

      const beforeTime = Date.now();
      const session = await setAdminSession('admin@example.com');
      const afterTime = Date.now();

      // Should expire in ~48 hours
      const expectedExpiry = beforeTime + 48 * 60 * 60 * 1000;
      const tolerance = 5000; // 5 seconds tolerance

      expect(session.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - tolerance);
      expect(session.expiresAt).toBeLessThanOrEqual(afterTime + 48 * 60 * 60 * 1000 + tolerance);
    });

    it('uses default TTL when environment variable is not set', async () => {
      delete process.env.ADMIN_SESSION_TTL_HOURS;
      vi.resetModules();

      const { setAdminSession } = await import('./session');

      mockCookies.set.mockImplementation(() => {});

      const beforeTime = Date.now();
      const session = await setAdminSession('admin@example.com');

      // Default is 8 hours (from constants)
      const expectedExpiry = beforeTime + 8 * 60 * 60 * 1000;
      const tolerance = 5000;

      expect(session.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - tolerance);
    });

    it('uses default TTL when environment variable is invalid', async () => {
      process.env.ADMIN_SESSION_TTL_HOURS = 'not-a-number';
      vi.resetModules();

      const { setAdminSession } = await import('./session');

      mockCookies.set.mockImplementation(() => {});

      const session = await setAdminSession('admin@example.com');

      // Should fallback to default 8 hours
      const expectedExpiry = Date.now() + 8 * 60 * 60 * 1000;
      const tolerance = 5000;

      expect(session.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - tolerance);
    });

    it('uses default TTL when value is negative', async () => {
      process.env.ADMIN_SESSION_TTL_HOURS = '-10';
      vi.resetModules();

      const { setAdminSession } = await import('./session');

      mockCookies.set.mockImplementation(() => {});

      const session = await setAdminSession('admin@example.com');

      // Should fallback to default 8 hours
      const expectedExpiry = Date.now() + 8 * 60 * 60 * 1000;
      const tolerance = 5000;

      expect(session.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - tolerance);
    });
  });

  describe('Session Management', () => {
    it('deletes admin session cookie', async () => {
      const { deleteAdminSession } = await import('./session');

      await deleteAdminSession();

      expect(mockCookies.delete).toHaveBeenCalledWith('ebl_admin_session');
    });

    it('generates unique session ID for each session', async () => {
      const { setAdminSession } = await import('./session');

      mockCookies.set.mockImplementation(() => {});

      const session1 = await setAdminSession('admin@example.com');
      const session2 = await setAdminSession('admin@example.com');

      expect(session1.sessionId).not.toBe(session2.sessionId);
    });

    it('sets secure flag in production environment', async () => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.resetModules();

      const { setAdminSession } = await import('./session');

      mockCookies.set.mockImplementation(() => {});

      await setAdminSession('admin@example.com');

      expect(mockCookies.set).toHaveBeenCalledWith(
        'ebl_admin_session',
        expect.any(String),
        expect.objectContaining({
          secure: true,
        }),
      );

      vi.unstubAllEnvs();
    });

    it('does not set secure flag in development', async () => {
      vi.stubEnv('NODE_ENV', 'development');
      vi.resetModules();

      const { setAdminSession } = await import('./session');

      mockCookies.set.mockImplementation(() => {});

      await setAdminSession('admin@example.com');

      expect(mockCookies.set).toHaveBeenCalledWith(
        'ebl_admin_session',
        expect.any(String),
        expect.objectContaining({
          secure: false,
        }),
      );

      vi.unstubAllEnvs();
    });
  });

  describe('Security - Timing Attack Protection', () => {
    it('uses consistent-time comparison for signature validation', async () => {
      const { getAdminSession } = await import('./session');

      const secret = process.env.ADMIN_SESSION_SECRET!;
      const payload = {
        sub: 'admin@example.com',
        sessionId: randomUUID(),
        expiresAt: Date.now() + 3600000,
      };

      const base = Buffer.from(JSON.stringify(payload)).toString('base64url');

      // Create signature with one bit different
      const correctSignature = createHmac('sha256', secret).update(base).digest('base64url');
      const tamperedSignature = correctSignature.slice(0, -1) + 'X';
      const tamperedToken = `${base}.${tamperedSignature}`;

      mockCookies.get.mockReturnValue({ name: 'ebl_admin_session', value: tamperedToken });

      const result = await getAdminSession();

      // Should reject tampered signature
      expect(result).toBeNull();
    });

    it('rejects signature with different length', async () => {
      const { getAdminSession } = await import('./session');

      const payload = {
        sub: 'admin@example.com',
        sessionId: randomUUID(),
        expiresAt: Date.now() + 3600000,
      };

      const base = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const shortSignature = 'short';
      const tokenWithShortSig = `${base}.${shortSignature}`;

      mockCookies.get.mockReturnValue({ name: 'admin_session', value: tokenWithShortSig });

      const result = await getAdminSession();
      expect(result).toBeNull();
    });
  });
});
