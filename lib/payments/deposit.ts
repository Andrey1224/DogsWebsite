const DEFAULT_FIXED_DEPOSIT = 300;

export type DepositCalculationMode = 'fixed' | 'percent';

export interface DepositCalculationOptions {
  /**
   * Puppy price in USD (nullable when unknown)
   */
  priceUsd?: number | null;
  /**
   * Calculation strategy. `fixed` (default) caps the deposit by puppy price.
   * `percent` multiplies price by `percent` and applies caps/mins.
   */
  mode?: DepositCalculationMode;
  /**
   * Fixed amount when `mode === 'fixed'` or when price is missing.
   */
  fixedAmount?: number;
  /**
   * Percentage (expressed as decimal, e.g. 0.25 = 25%) used when `mode === 'percent'`.
   */
  percent?: number;
  /**
   * Optional ceiling for percent-based deposits.
   */
  cap?: number;
  /**
   * Optional floor for either strategy.
   */
  min?: number;
}

function normalizePositive(value?: number | null): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate the reservation deposit based on puppy price and configuration.
 */
export function calculateDepositAmount(options: DepositCalculationOptions): number {
  const {
    priceUsd,
    mode = 'fixed',
    fixedAmount = DEFAULT_FIXED_DEPOSIT,
    percent = 0.0,
    cap,
    min,
  } = options;

  const price = normalizePositive(priceUsd);
  const normalizedCap = normalizePositive(cap);
  const normalizedMin = normalizePositive(min);
  const normalizedFixed = normalizePositive(fixedAmount) ?? DEFAULT_FIXED_DEPOSIT;

  const clampToPrice = (value: number): number => {
    if (price === null) {
      return value;
    }

    return Math.min(value, price);
  };

  const applyFloor = (value: number): number => {
    if (normalizedMin === null) {
      return value;
    }

    return Math.max(value, normalizedMin);
  };

  const percentRatio = typeof percent === 'number' && percent > 0 ? percent : null;

  if (mode === 'percent' && price !== null && percentRatio) {
    let amount = price * percentRatio;

    if (normalizedCap !== null) {
      amount = Math.min(amount, normalizedCap);
    }

    amount = clampToPrice(applyFloor(amount));
    return roundCurrency(amount);
  }

  // Default: fixed amount with fallback to price if it's lower.
  const clampedFixed = clampToPrice(normalizedFixed);
  return roundCurrency(applyFloor(clampedFixed));
}
