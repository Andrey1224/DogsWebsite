import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import {
  getRequiredEnv,
  getSiteUrl,
  validatePaymentEnv,
} from './env';

const ORIGINAL_ENV = { ...process.env };

describe('env utilities', () => {
  beforeEach(() => {
    Object.assign(process.env, ORIGINAL_ENV);
  });

  afterEach(() => {
    Object.assign(process.env, ORIGINAL_ENV);
  });

  it('throws when required env variable is missing', () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(() => getRequiredEnv('STRIPE_SECRET_KEY', 'Stripe secret'))
      .toThrow(/Missing required environment variable/);
  });

  it('returns inferred site URL in development', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe('http://localhost:3000');
  });

  it('validates payment env and lists missing keys', () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.PAYPAL_CLIENT_ID;
    delete process.env.PAYPAL_CLIENT_SECRET;

    expect(() => validatePaymentEnv()).toThrow(/Missing required payment environment variables/);
  });
});
