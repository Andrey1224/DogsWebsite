/**
 * Tests for webhook health check endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        data: [],
        error: null,
      })),
    })),
  })),
}));

describe('Webhook Health Check Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return healthy status when no webhook events exist', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.healthy).toBe(true);
    expect(data.checks).toBeDefined();
    expect(data.checks.stripe).toBeDefined();
    expect(data.checks.paypal).toBeDefined();
    expect(data.summary).toBeDefined();
  });

  it('should include timestamp in response', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should include cache-control headers', async () => {
    const response = await GET();

    expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate');
  });

  it('should return provider health metrics', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.checks.stripe).toMatchObject({
      healthy: expect.any(Boolean),
      recentEvents: expect.any(Number),
      failedEvents: expect.any(Number),
      lastSuccessTime: expect.toBeOneOf([expect.any(String), null]),
      lastFailureTime: expect.toBeOneOf([expect.any(String), null]),
      errorRate: expect.any(Number),
    });

    expect(data.checks.paypal).toMatchObject({
      healthy: expect.any(Boolean),
      recentEvents: expect.any(Number),
      failedEvents: expect.any(Number),
      lastSuccessTime: expect.toBeOneOf([expect.any(String), null]),
      lastFailureTime: expect.toBeOneOf([expect.any(String), null]),
      errorRate: expect.any(Number),
    });
  });

  it('should return summary metrics', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.summary).toMatchObject({
      totalEvents: expect.any(Number),
      recentEvents: expect.any(Number),
      failedEvents: expect.any(Number),
      lastEventTime: expect.toBeOneOf([expect.any(String), null]),
    });
  });
});

// Custom matcher for vitest
expect.extend({
  toBeOneOf(received, expected: unknown[]) {
    const pass = expected.some((item) => {
      if (item === null) return received === null;
      if (typeof item === 'string') return received === expect.any(String);
      return false;
    });

    return {
      pass,
      message: () => `expected ${received} to be one of ${expected.join(', ')}`,
    };
  },
});
