/**
 * Cron Expire Reservations API Route Tests
 *
 * Tests the POST/GET /api/cron/expire-reservations endpoint that expires
 * pending reservations. Ensures proper authorization, database interaction,
 * and error handling.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { POST, GET } from './route';

// Mock Supabase client
const mockRpc = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createServiceRoleClient: vi.fn(() => ({
    rpc: mockRpc,
  })),
}));

describe('POST /api/cron/expire-reservations', () => {
  const mockCronSecret = 'test_cron_secret_123';

  const createRequest = (authHeader?: string): NextRequest => {
    const headers: Record<string, string> = {};
    if (authHeader !== undefined) {
      headers['authorization'] = authHeader;
    }

    return new NextRequest('http://localhost:3000/api/cron/expire-reservations', {
      method: 'POST',
      headers,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = mockCronSecret;
  });

  it('expires reservations successfully with valid authorization', async () => {
    mockRpc.mockResolvedValue({
      data: 3,
      error: null,
    });

    const request = createRequest(`Bearer ${mockCronSecret}`);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      expired: 3,
      timestamp: expect.any(String),
    });

    expect(mockRpc).toHaveBeenCalledWith('expire_pending_reservations');
  });

  it('returns 500 when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET;

    const request = createRequest('Bearer some_token');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'CRON_SECRET is not configured' });
  });

  it('returns 401 when authorization header is missing', async () => {
    const request = createRequest();
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('returns 401 when authorization header is incorrect', async () => {
    const request = createRequest('Bearer wrong_secret');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('returns 401 when authorization header format is invalid', async () => {
    const request = createRequest('InvalidFormat');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('handles database error gracefully', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: {
        message: 'Database connection failed',
        code: 'PGRST301',
      },
    });

    const request = createRequest(`Bearer ${mockCronSecret}`);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to expire reservations' });
  });

  it('handles unexpected errors gracefully', async () => {
    mockRpc.mockRejectedValue(new Error('Unexpected database error'));

    const request = createRequest(`Bearer ${mockCronSecret}`);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Unexpected error' });
  });

  it('handles zero expired reservations', async () => {
    mockRpc.mockResolvedValue({
      data: 0,
      error: null,
    });

    const request = createRequest(`Bearer ${mockCronSecret}`);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      expired: 0,
      timestamp: expect.any(String),
    });
  });

  it('handles null data from RPC gracefully', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: null,
    });

    const request = createRequest(`Bearer ${mockCronSecret}`);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      expired: 0,
      timestamp: expect.any(String),
    });
  });

  it('returns valid ISO timestamp', async () => {
    mockRpc.mockResolvedValue({
      data: 1,
      error: null,
    });

    const request = createRequest(`Bearer ${mockCronSecret}`);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('handles Bearer token with extra spaces', async () => {
    const request = createRequest(`Bearer  ${mockCronSecret}  `);
    const response = await POST(request);
    const data = await response.json();

    // Should fail due to extra spaces
    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('is case-sensitive for Bearer keyword', async () => {
    const request = createRequest(`bearer ${mockCronSecret}`);
    const response = await POST(request);
    const data = await response.json();

    // Should fail due to lowercase 'bearer'
    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });
});

describe('GET /api/cron/expire-reservations', () => {
  const mockCronSecret = 'test_cron_secret_123';

  const createRequest = (authHeader?: string): NextRequest => {
    const headers: Record<string, string> = {};
    if (authHeader !== undefined) {
      headers['authorization'] = authHeader;
    }

    return new NextRequest('http://localhost:3000/api/cron/expire-reservations', {
      method: 'GET',
      headers,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = mockCronSecret;
  });

  it('delegates to POST handler', async () => {
    mockRpc.mockResolvedValue({
      data: 2,
      error: null,
    });

    const request = createRequest(`Bearer ${mockCronSecret}`);
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      expired: 2,
      timestamp: expect.any(String),
    });

    expect(mockRpc).toHaveBeenCalledWith('expire_pending_reservations');
  });

  it('returns 401 for GET without authorization', async () => {
    const request = createRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
  });
});
