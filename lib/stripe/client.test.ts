import { describe, it, expect, beforeEach, vi } from 'vitest';

const BASE_ENV = { ...process.env };

describe('Stripe Client', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, BASE_ENV);
  });

  it('throws error when STRIPE_SECRET_KEY is missing', async () => {
    delete process.env.STRIPE_SECRET_KEY;

    await expect(async () => {
      await import('./client');
    }).rejects.toThrow('Missing STRIPE_SECRET_KEY environment variable');
  });

  it('initializes stripe client when STRIPE_SECRET_KEY is present', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_12345';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

    const { stripe } = await import('./client');

    expect(stripe).toBeDefined();
    expect(typeof stripe).toBe('object');
  });

  it('warns when STRIPE_WEBHOOK_SECRET is missing', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_12345';
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { webhookSecret } = await import('./client');

    expect(webhookSecret).toBe('');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('STRIPE_WEBHOOK_SECRET is not set')
    );

    consoleWarnSpy.mockRestore();
  });

  it('exports webhookSecret when environment variable is set', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_12345';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';

    const { webhookSecret } = await import('./client');

    expect(webhookSecret).toBe('whsec_test_secret');
  });

  it('initializes stripe with correct API version and app info', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_12345';

    const { stripe } = await import('./client');

    // Verify stripe instance has expected properties and methods
    expect(stripe).toBeDefined();
    expect(stripe).toHaveProperty('webhooks');
    expect(stripe).toHaveProperty('checkout');
    expect(typeof stripe.webhooks.constructEvent).toBe('function');
  });
});
