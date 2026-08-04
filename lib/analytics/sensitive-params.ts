/**
 * Denylist of event-param keys that must never reach GA4 or Meta, even after consent is
 * granted. Consent controls whether analytics run at all — it never authorizes sending
 * raw form input (name, email, phone, message, etc.) or identifiers (tokens, session/order/
 * customer IDs) to a third party.
 */
const SENSITIVE_EVENT_PARAM_KEYS = new Set([
  'email',
  'e-mail',
  'phone',
  'telephone',
  'name',
  'first_name',
  'last_name',
  'address',
  'message',
  'password',
  'pass',
  'token',
  'access_token',
  'auth',
  'authorization',
  'code',
  'key',
  'secret',
  'session',
  'session_id',
  'jwt',
  'user_id',
  'customer_id',
  'order_id',
]);

export function stripSensitiveEventParams(
  params?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([key]) => !SENSITIVE_EVENT_PARAM_KEYS.has(key.toLowerCase())),
  );
}
