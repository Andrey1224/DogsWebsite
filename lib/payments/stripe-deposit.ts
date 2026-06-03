import 'server-only';

export const DEFAULT_STRIPE_DEPOSIT_AMOUNT_CENTS = 30000;
export const MINIMUM_USD_CHARGE_CENTS = 50;

type StripeDepositEnv = Partial<Record<'STRIPE_DEPOSIT_AMOUNT_CENTS', string>>;

export class StripeDepositAmountConfigError extends Error {
  constructor(value: string) {
    super(
      `Invalid STRIPE_DEPOSIT_AMOUNT_CENTS value "${value}". Expected a positive integer greater than or equal to ${MINIMUM_USD_CHARGE_CENTS}.`,
    );
    this.name = 'StripeDepositAmountConfigError';
  }
}

export function getStripeDepositAmountCents(
  env: StripeDepositEnv = process.env as StripeDepositEnv,
): number {
  const rawValue = env.STRIPE_DEPOSIT_AMOUNT_CENTS;

  if (!rawValue) {
    return DEFAULT_STRIPE_DEPOSIT_AMOUNT_CENTS;
  }

  if (!/^[1-9]\d*$/.test(rawValue)) {
    throw new StripeDepositAmountConfigError(rawValue);
  }

  const amountCents = Number.parseInt(rawValue, 10);

  if (!Number.isSafeInteger(amountCents) || amountCents < MINIMUM_USD_CHARGE_CENTS) {
    throw new StripeDepositAmountConfigError(rawValue);
  }

  return amountCents;
}

export function getStripeDepositAmountDollars(
  env: StripeDepositEnv = process.env as StripeDepositEnv,
): number {
  return getStripeDepositAmountCents(env) / 100;
}

export function formatStripeDepositAmount(amountCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}
