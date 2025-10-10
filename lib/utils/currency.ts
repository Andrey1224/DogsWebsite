/**
 * Currency Utilities
 *
 * Helper functions for currency formatting and conversion.
 */

/**
 * Format amount in cents to USD string
 *
 * @param cents - Amount in cents (e.g., 30000)
 * @returns Formatted USD string (e.g., "$300.00")
 *
 * @example
 * formatCentsToUSD(30000) // "$300.00"
 * formatCentsToUSD(12345) // "$123.45"
 */
export function formatCentsToUSD(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars);
}

/**
 * Convert USD amount to cents
 *
 * @param usd - Amount in USD (e.g., 300)
 * @returns Amount in cents (e.g., 30000)
 *
 * @example
 * usdToCents(300) // 30000
 * usdToCents(123.45) // 12345
 */
export function usdToCents(usd: number): number {
  return Math.round(usd * 100);
}

/**
 * Convert cents to USD decimal
 *
 * @param cents - Amount in cents
 * @returns Amount in USD as decimal
 *
 * @example
 * centsToUSD(30000) // 300.00
 * centsToUSD(12345) // 123.45
 */
export function centsToUSD(cents: number): number {
  return cents / 100;
}

/**
 * Format USD amount as string for PayPal
 *
 * PayPal requires amounts as strings with exactly 2 decimal places
 *
 * @param usd - Amount in USD
 * @returns Formatted string (e.g., "300.00")
 *
 * @example
 * formatUSDForPayPal(300) // "300.00"
 * formatUSDForPayPal(123.456) // "123.46"
 */
export function formatUSDForPayPal(usd: number): string {
  return usd.toFixed(2);
}

/**
 * Validate deposit amount
 *
 * Ensures the amount is exactly $300 (our standard deposit)
 *
 * @param amountUsd - Amount in USD
 * @returns Whether the amount is valid
 */
export function isValidDepositAmount(amountUsd: number): boolean {
  return amountUsd === 300;
}

/**
 * Standard deposit amount in USD
 */
export const DEPOSIT_AMOUNT_USD = 300;

/**
 * Standard deposit amount in cents (for Stripe)
 */
export const DEPOSIT_AMOUNT_CENTS = 30000;
