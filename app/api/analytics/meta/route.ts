import { NextRequest, NextResponse } from 'next/server';

import {
  META_STANDARD_EVENTS,
  sendMetaConversionEvent,
  type MetaStandardEvent,
} from '@/lib/analytics/meta-conversions-api';

const CONSENT_COOKIE = 'exoticbulldoglegacy_consent';
const allowedEvents = new Set<string>(META_STANDARD_EVENTS);

export async function POST(request: NextRequest) {
  if (request.cookies.get(CONSENT_COOKIE)?.value !== 'granted') {
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
    input.eventId.length > 100
  ) {
    return NextResponse.json({ accepted: false }, { status: 400 });
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const accepted = await sendMetaConversionEvent({
    eventName: input.eventName as MetaStandardEvent,
    eventId: input.eventId,
    eventSourceUrl:
      typeof input.sourceUrl === 'string' ? input.sourceUrl.slice(0, 2048) : undefined,
    customData:
      input.customData && typeof input.customData === 'object'
        ? (input.customData as Record<string, unknown>)
        : undefined,
    userData: {
      clientIpAddress: forwarded?.split(',')[0]?.trim(),
      clientUserAgent: request.headers.get('user-agent'),
      fbp: typeof input.fbp === 'string' ? input.fbp : undefined,
      fbc: typeof input.fbc === 'string' ? input.fbc : undefined,
    },
  });

  return NextResponse.json({ accepted }, { status: accepted ? 202 : 503 });
}
