import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { verifyHCaptcha } from './hcaptcha';

const ORIGINAL_ENV = { ...process.env };

describe('verifyHCaptcha', () => {
  beforeEach(() => {
    Object.assign(process.env, ORIGINAL_ENV);
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    Object.assign(process.env, ORIGINAL_ENV);
    vi.restoreAllMocks();
  });

  it('allows bypass token outside production', async () => {
    process.env.HCAPTCHA_BYPASS_TOKEN = 'bypass-token';
    vi.stubEnv('NODE_ENV', 'development');
    const result = await verifyHCaptcha('bypass-token');
    expect(result).toEqual({ ok: true });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('skips verification when secret missing in development', async () => {
    delete process.env.HCAPTCHA_SECRET_KEY;
    vi.stubEnv('NODE_ENV', 'development');

    const result = await verifyHCaptcha('token');

    expect(result).toEqual({ ok: true });
  });

  it('rejects missing secret in production', async () => {
    delete process.env.HCAPTCHA_SECRET_KEY;
    vi.stubEnv('NODE_ENV', 'production');

    const result = await verifyHCaptcha('token');

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      message: expect.stringContaining('Captcha misconfigured'),
    });
  });

  it('returns error when verification endpoint fails', async () => {
    process.env.HCAPTCHA_SECRET_KEY = 'secret';
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as unknown as Response);

    const result = await verifyHCaptcha('token', '203.0.113.5');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(result).toEqual({
      ok: false,
      message: expect.stringContaining('status 500'),
    });
  });

  it('propagates error codes from hcaptcha response', async () => {
    process.env.HCAPTCHA_SECRET_KEY = 'secret';
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        'error-codes': ['invalid-input-response', 'bad-request'],
      }),
    } as unknown as Response);

    const result = await verifyHCaptcha('token');

    expect(result).toEqual({
      ok: false,
      message: expect.stringContaining('invalid-input-response'),
    });
  });

  it('returns ok for successful verification', async () => {
    process.env.HCAPTCHA_SECRET_KEY = 'secret';
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as unknown as Response);

    const result = await verifyHCaptcha('token');

    expect(result).toEqual({ ok: true });
  });
});
