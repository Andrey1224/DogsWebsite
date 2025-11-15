import { describe, expect, it } from 'vitest';
import { calculateDepositAmount } from './deposit';

describe('calculateDepositAmount', () => {
  it('defaults to a fixed $300 deposit capped by puppy price', () => {
    expect(calculateDepositAmount({ priceUsd: 2000 })).toBe(300);
    expect(calculateDepositAmount({ priceUsd: 150 })).toBe(150);
  });

  it('falls back to the fixed amount when price is missing', () => {
    expect(calculateDepositAmount({ priceUsd: null })).toBe(300);
  });

  it('supports percentage-based deposits with an optional cap', () => {
    const amount = calculateDepositAmount({
      priceUsd: 2500,
      mode: 'percent',
      percent: 0.25,
      cap: 400,
    });

    expect(amount).toBe(400);
  });

  it('applies minimums and caps the result by the puppy price', () => {
    const amount = calculateDepositAmount({
      priceUsd: 350,
      mode: 'percent',
      percent: 0.5,
      min: 200,
      cap: 500,
    });

    expect(amount).toBe(200);

    const exceedsPrice = calculateDepositAmount({
      priceUsd: 180,
      mode: 'percent',
      percent: 0.9,
      min: 250,
    });

    expect(exceedsPrice).toBe(180);
  });

  it('rounds to cents for fractional deposits', () => {
    const amount = calculateDepositAmount({
      priceUsd: 999.99,
      mode: 'percent',
      percent: 0.175,
    });

    expect(amount).toBe(175);
  });
});
