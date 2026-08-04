/**
 * Shared URL sanitizer for every analytics integration (GA4, Meta, Vercel Analytics).
 *
 * Marketing/attribution query params are allowlisted; everything else is dropped,
 * including anything not explicitly known to be safe (form values, session/order/customer
 * identifiers, tokens, etc.). This is intentionally an allowlist, not a denylist, so an
 * unrecognized param is stripped by default rather than accidentally forwarded.
 */

const ALLOWED_QUERY_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'dclid',
  'fbclid',
  'msclkid',
]);

function cleanSearch(search: string): string {
  if (!search) return '';
  const params = new URLSearchParams(search);
  const cleaned = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    if (ALLOWED_QUERY_PARAMS.has(key.toLowerCase())) {
      cleaned.append(key, value);
    }
  }
  const result = cleaned.toString();
  return result ? `?${result}` : '';
}

function currentOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

function currentPathname(): string {
  return typeof window !== 'undefined' ? window.location.pathname : '/';
}

export type SafeUrlParts = {
  safeLocation: string;
  safePath: string;
};

/**
 * Sanitizes an absolute URL (e.g. `window.location.href`) for GA4/Meta page-view fields.
 * On parse failure, falls back to the current page's origin + pathname only — it never
 * echoes back the unparsed input, since that input is exactly what failed validation.
 */
export function getSafeUrlParts(href: string): SafeUrlParts {
  try {
    const url = new URL(href);
    const search = cleanSearch(url.search);
    return {
      safeLocation: `${url.origin}${url.pathname}${search}`,
      safePath: `${url.pathname}${search}`,
    };
  } catch {
    return {
      safeLocation: `${currentOrigin()}${currentPathname()}`,
      safePath: currentPathname(),
    };
  }
}

/**
 * Sanitizes a URL-or-path-shaped string (full href or a bare `/path?query`), preserving
 * whichever shape it started as. Used for generic event params like `page_path` /
 * `context_path` and for the Vercel Analytics `beforeSend` hook.
 */
export function sanitizeUrlValue(value: string): string {
  const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(value);
  try {
    const url = hasProtocol
      ? new URL(value)
      : new URL(value, currentOrigin() || 'http://localhost');
    const search = cleanSearch(url.search);
    return hasProtocol ? `${url.origin}${url.pathname}${search}` : `${url.pathname}${search}`;
  } catch {
    return currentPathname();
  }
}
