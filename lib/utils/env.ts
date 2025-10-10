/**
 * Environment Variable Utilities
 *
 * Helper functions for accessing and validating payment-related
 * environment variables.
 */

/**
 * Get required environment variable
 *
 * Throws an error if the variable is not set
 *
 * @param key - Environment variable key
 * @param description - Human-readable description for error messages
 * @returns Environment variable value
 * @throws Error if variable is not set
 */
export function getRequiredEnv(key: string, description?: string): string {
  const value = process.env[key];

  if (!value) {
    const desc = description || key;
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Please add ${desc} to your .env.local file.`
    );
  }

  return value;
}

/**
 * Get optional environment variable with default value
 *
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @returns Environment variable value or default
 */
export function getEnvWithDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get site URL
 *
 * Uses NEXT_PUBLIC_SITE_URL in production, localhost in development
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (isDevelopment()) {
    return 'http://localhost:3000';
  }

  throw new Error(
    'NEXT_PUBLIC_SITE_URL must be set in production environments'
  );
}

/**
 * Validate payment environment variables
 *
 * Checks that all required payment-related env vars are set
 * Useful for startup validation
 *
 * @throws Error if any required variables are missing
 */
export function validatePaymentEnv(): void {
  const requiredVars = [
    { key: 'STRIPE_SECRET_KEY', desc: 'Stripe secret key' },
    { key: 'STRIPE_WEBHOOK_SECRET', desc: 'Stripe webhook secret' },
    { key: 'PAYPAL_CLIENT_ID', desc: 'PayPal client ID' },
    { key: 'PAYPAL_CLIENT_SECRET', desc: 'PayPal client secret' },
  ];

  const missing: string[] = [];

  for (const { key, desc } of requiredVars) {
    if (!process.env[key]) {
      missing.push(`${key} (${desc})`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required payment environment variables:\n- ${missing.join('\n- ')}\n\n` +
        'Please add these to your .env.local file. See .env.example for details.'
    );
  }
}
