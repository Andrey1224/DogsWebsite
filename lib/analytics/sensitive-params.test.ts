import { describe, expect, it } from 'vitest';
import { stripSensitiveEventParams } from './sensitive-params';

describe('stripSensitiveEventParams', () => {
  it('returns undefined when given undefined', () => {
    expect(stripSensitiveEventParams(undefined)).toBeUndefined();
  });

  it('strips known PII/identifier keys', () => {
    const result = stripSensitiveEventParams({
      email: 'test@example.com',
      phone: '555-1234',
      name: 'Jane Doe',
      first_name: 'Jane',
      last_name: 'Doe',
      address: '123 Main St',
      message: 'Please call me',
      password: 'hunter2',
      token: 'abc123',
      access_token: 'abc123',
      auth: 'Bearer x',
      authorization: 'Bearer x',
      code: 'abc',
      key: 'abc',
      secret: 'abc',
      session: 'abc',
      session_id: 'cs_test_123',
      jwt: 'eyJ',
      user_id: 'u1',
      customer_id: 'cus_1',
      order_id: 'order_1',
    });

    expect(result).toEqual({});
  });

  it('is case-insensitive', () => {
    const result = stripSensitiveEventParams({ Email: 'test@example.com', TOKEN: 'abc' });
    expect(result).toEqual({});
  });

  it('keeps app-controlled safe keys', () => {
    const result = stripSensitiveEventParams({
      puppy_slug: 'sunny',
      breed: 'french_bulldog',
      content_name: 'Sunny',
      value: 300,
      currency: 'USD',
    });

    expect(result).toEqual({
      puppy_slug: 'sunny',
      breed: 'french_bulldog',
      content_name: 'Sunny',
      value: 300,
      currency: 'USD',
    });
  });
});
