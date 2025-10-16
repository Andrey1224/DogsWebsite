import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const BASE_ENV = { ...process.env };

import type { DepositPaidEventParams } from './types';

const mockEvent: DepositPaidEventParams = {
  value: 500,
  currency: 'USD',
  puppy_slug: 'duke-the-bulldog',
  puppy_name: 'Duke',
  payment_provider: 'stripe',
  reservation_id: 'res_123',
};

describe('trackDepositPaid', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, BASE_ENV);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.assign(process.env, BASE_ENV);
    vi.restoreAllMocks();
  });

  it('skips tracking when GA configuration is missing', async () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    delete process.env.GA4_API_SECRET;
    vi.stubEnv('NODE_ENV', 'production');

    const { trackDepositPaid } = await import('./server-events');

    await trackDepositPaid(mockEvent, 'client-1');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('sends payload when configuration is present', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-123456';
    process.env.GA4_API_SECRET = 'super-secret';

    const fetchMock = vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    } as unknown as Response);

    const { trackDepositPaid } = await import('./server-events');

    await trackDepositPaid(mockEvent, 'client-1');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('measurement_id=G-123456'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('logs an error when GA responds with non-ok status', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-123456';
    process.env.GA4_API_SECRET = 'super-secret';

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as unknown as Response);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { trackDepositPaid } = await import('./server-events');

    await trackDepositPaid(mockEvent);

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to send GA4 event:',
      500,
      'Internal Server Error',
    );
  });
});
