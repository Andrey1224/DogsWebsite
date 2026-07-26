import { describe, expect, it } from 'vitest';

import {
  formatStripeDepositAmount,
  getStripeDepositAmountCents,
  getStripeDepositAmountDollars,
  StripeDepositAmountConfigError,
} from './stripe-deposit';

describe('Stripe deposit config', () => {
  it('defaults to 30000 cents when env is missing', () => {
    expect(getStripeDepositAmountCents({})).toBe(30000);
    expect(getStripeDepositAmountDollars({})).toBe(300);
  });

  it('uses STRIPE_DEPOSIT_AMOUNT_CENTS when configured', () => {
    expect(getStripeDepositAmountCents({ STRIPE_DEPOSIT_AMOUNT_CENTS: '100' })).toBe(100);
    expect(getStripeDepositAmountDollars({ STRIPE_DEPOSIT_AMOUNT_CENTS: '100' })).toBe(1);
  });

  it.each(['0', '-100', '49', '1.00', 'abc'])('rejects invalid value %s', (value) => {
    expect(() => getStripeDepositAmountCents({ STRIPE_DEPOSIT_AMOUNT_CENTS: value })).toThrow(
      StripeDepositAmountConfigError,
    );
  });

  it('formats whole-dollar and cent amounts for checkout copy', () => {
    expect(formatStripeDepositAmount(30000)).toBe('$300');
    expect(formatStripeDepositAmount(100)).toBe('$1');
    expect(formatStripeDepositAmount(150)).toBe('$1.50');
  });
});
