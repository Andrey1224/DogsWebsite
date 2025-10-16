import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

describe('BUSINESS_PROFILE', () => {
  beforeEach(() => {
    Object.assign(process.env, ORIGINAL_ENV);
  });

  afterEach(() => {
    Object.assign(process.env, ORIGINAL_ENV);
  });

  it('normalizes address fields from formatted string', async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_CONTACT_ADDRESS = '123 Maple St, Birmingham, AL 35203, USA';
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_CONTACT_LATITUDE = '34.1234';
    process.env.NEXT_PUBLIC_CONTACT_LONGITUDE = '-85.9876';

    const { BUSINESS_PROFILE } = await import('./business');

    expect(BUSINESS_PROFILE.address).toMatchObject({
      streetAddress: '123 Maple St',
      addressLocality: 'Birmingham',
      addressRegion: 'AL',
      postalCode: '35203',
      addressCountry: 'US',
      formatted: '123 Maple St, Birmingham, AL 35203',
    });
    expect(BUSINESS_PROFILE.coordinates).toMatchObject({
      latitude: 34.1234,
      longitude: -85.9876,
    });
  });

  it('parses hours from semicolon-delimited string', async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_CONTACT_HOURS = JSON.stringify([
      { day: 'Mon', opens: '09:00', closes: '17:00' },
      { day: 'Tue', opens: '10:00', closes: '18:00' },
    ]);

    const { BUSINESS_PROFILE } = await import('./business');

    expect(BUSINESS_PROFILE.hours).toEqual([
      { day: 'Mon', opens: '09:00', closes: '17:00' },
      { day: 'Tue', opens: '10:00', closes: '18:00' },
    ]);
  });
});
