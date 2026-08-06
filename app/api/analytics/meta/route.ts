import { NextRequest, NextResponse } from 'next/server';

import {
  META_STANDARD_EVENTS,
  sendMetaConversionEvent,
} from '@/lib/analytics/meta-conversions-api';

const CONSENT_COOKIE = 'exoticbulldoglegacy_consent';

// Custom (non-standard) Meta events allowed through this endpoint, in addition to
// META_STANDARD_EVENTS. Kept as an explicit allowlist rather than accepting any
// client-supplied event name.
const ALLOWED_CUSTOM_EVENTS = new Set(['reserve_click']);
const allowedEvents = new Set<string>([...META_STANDARD_EVENTS, ...ALLOWED_CUSTOM_EVENTS]);

const MAX_SOURCE_URL_LENGTH = 512;
const MAX_STRING_FIELD_LENGTH = 200;
const MAX_CONTENT_IDS = 10;
const EVENT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

// Only these fields are ever forwarded to Meta's Conversions API as custom_data. Anything
// else (including arbitrary nested objects) is dropped rather than passed through.
const ALLOWED_CUSTOM_DATA_KEYS = new Set([
  'content_ids',
  'content_name',
  'content_category',
  'content_type',
  'value',
  'currency',
]);

function sanitizeCustomData(input: unknown): Record<string, unknown> | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (!ALLOWED_CUSTOM_DATA_KEYS.has(key)) continue;

    if (key === 'content_ids') {
      if (!Array.isArray(value)) continue;
      const ids = value
        .filter((item): item is string => typeof item === 'string')
        .slice(0, MAX_CONTENT_IDS)
        .map((item) => item.slice(0, MAX_STRING_FIELD_LENGTH));
      if (ids.length > 0) result.content_ids = ids;
      continue;
    }

    if (key === 'value') {
      if (typeof value === 'number' && Number.isFinite(value)) result.value = value;
      continue;
    }

    if (typeof value === 'string') {
      const trimmed = value.slice(0, MAX_STRING_FIELD_LENGTH);
      if (trimmed) result[key] = trimmed;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function isSameOriginRequest(request: NextRequest): boolean {
  // request.nextUrl.host reflects the host Next.js resolved the request against, so it
  // works the same in tests (constructed from the request URL) and in production (where a
  // client can't spoof it the way it could a raw Host header).
  const host = request.nextUrl.host;
  if (!host) return true; // Nothing to compare against — do not block on a missing signal.

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  // Neither header is present (e.g. some keepalive requests during external navigation) —
  // allow rather than break a legitimate outbound-click event.
  return true;
}

export async function POST(request: NextRequest) {
  if (request.cookies.get(CONSENT_COOKIE)?.value !== 'granted') {
    return NextResponse.json({ accepted: false }, { status: 403 });
  }

  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ accepted: false }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  if (
    typeof input.eventName !== 'string' ||
    !allowedEvents.has(input.eventName) ||
    typeof input.eventId !== 'string' ||
    input.eventId.length < 8 ||
    input.eventId.length > 100 ||
    !EVENT_ID_PATTERN.test(input.eventId)
  ) {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const accepted = await sendMetaConversionEvent({
    eventName: input.eventName,
    eventId: input.eventId,
    eventSourceUrl:
      typeof input.sourceUrl === 'string'
        ? input.sourceUrl.slice(0, MAX_SOURCE_URL_LENGTH)
        : undefined,
    customData: sanitizeCustomData(input.customData),
    userData: {
      clientIpAddress: forwarded?.split(',')[0]?.trim(),
      clientUserAgent: request.headers.get('user-agent'),
      fbp: typeof input.fbp === 'string' ? input.fbp.slice(0, MAX_STRING_FIELD_LENGTH) : undefined,
      fbc: typeof input.fbc === 'string' ? input.fbc.slice(0, MAX_STRING_FIELD_LENGTH) : undefined,
    },
  });

  return NextResponse.json({ accepted }, { status: accepted ? 202 : 503 });
}
