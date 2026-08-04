'use client';

import { Analytics } from '@vercel/analytics/next';
import type { BeforeSendEvent } from '@vercel/analytics/next';

import { sanitizeUrlValue } from '@/lib/analytics/safe-url';

function beforeSend(event: BeforeSendEvent): BeforeSendEvent {
  return { ...event, url: sanitizeUrlValue(event.url) };
}

/**
 * Wraps @vercel/analytics/next's <Analytics /> so the sensitive-param sanitizer can be
 * passed as beforeSend without crossing the Server -> Client Component boundary as a raw
 * function prop (app/layout.tsx is a Server Component).
 */
export function VercelAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
