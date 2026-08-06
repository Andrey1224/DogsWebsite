import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from './route';

vi.mock('@/lib/analytics/meta-conversions-api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/analytics/meta-conversions-api')>(
    '@/lib/analytics/meta-conversions-api',
  );
  return {
    META_STANDARD_EVENTS: actual.META_STANDARD_EVENTS,
    sendMetaConversionEvent: vi.fn().mockResolvedValue(true),
  };
});

const VALID_EVENT_ID = 'evt-12345678';

function createRequest(
  body: unknown,
  {
    consent = 'granted',
    origin,
    referer,
    host = 'example.com',
  }: { consent?: string | null; origin?: string; referer?: string; host?: string } = {},
): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json', host };
  if (consent !== null) headers['cookie'] = `exoticbulldoglegacy_consent=${consent}`;
  if (origin) headers['origin'] = origin;
  if (referer) headers['referer'] = referer;

  return new NextRequest('http://example.com/api/analytics/meta', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('POST /api/analytics/meta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects requests without the granted consent cookie', async () => {
    const response = await POST(
      createRequest({ eventName: 'Contact', eventId: VALID_EVENT_ID }, { consent: 'denied' }),
    );
    expect(response.status).toBe(403);
  });

  it('rejects requests with no consent cookie at all', async () => {
    const response = await POST(
      createRequest({ eventName: 'Contact', eventId: VALID_EVENT_ID }, { consent: null }),
    );
    expect(response.status).toBe(403);
  });

  it('rejects an event name outside the allowlist', async () => {
    const response = await POST(
      createRequest({ eventName: 'DeleteAccount', eventId: VALID_EVENT_ID }),
    );
    expect(response.status).toBe(400);
  });

  it('accepts the reserve_click custom event', async () => {
    const response = await POST(
      createRequest({ eventName: 'reserve_click', eventId: VALID_EVENT_ID }),
    );
    expect(response.status).toBe(202);
  });

  it('rejects a malformed eventId', async () => {
    const response = await POST(createRequest({ eventName: 'Contact', eventId: 'short' }));
    expect(response.status).toBe(400);

    const withBadChars = await POST(
      createRequest({ eventName: 'Contact', eventId: 'not an id! <script>' }),
    );
    expect(withBadChars.status).toBe(400);
  });

  it('accepts a same-origin request (matching Origin header)', async () => {
    const response = await POST(
      createRequest(
        { eventName: 'Contact', eventId: VALID_EVENT_ID },
        { origin: 'http://example.com', host: 'example.com' },
      ),
    );
    expect(response.status).toBe(202);
  });

  it('rejects a cross-origin request (mismatched Origin header)', async () => {
    const response = await POST(
      createRequest(
        { eventName: 'Contact', eventId: VALID_EVENT_ID },
        { origin: 'https://evil.example', host: 'example.com' },
      ),
    );
    expect(response.status).toBe(403);
  });

  it('rejects a cross-origin request (mismatched Referer header, no Origin)', async () => {
    const response = await POST(
      createRequest(
        { eventName: 'Contact', eventId: VALID_EVENT_ID },
        { referer: 'https://evil.example/page', host: 'example.com' },
      ),
    );
    expect(response.status).toBe(403);
  });

  it('allows a request with neither Origin nor Referer present', async () => {
    const response = await POST(
      createRequest({ eventName: 'Contact', eventId: VALID_EVENT_ID }, { host: 'example.com' }),
    );
    expect(response.status).toBe(202);
  });

  it('forwards only allowlisted customData fields, dropping unknown/nested ones', async () => {
    const { sendMetaConversionEvent } = await import('@/lib/analytics/meta-conversions-api');

    await POST(
      createRequest({
        eventName: 'Purchase',
        eventId: VALID_EVENT_ID,
        customData: {
          value: 300,
          currency: 'USD',
          content_name: 'Sunny',
          // 123 (a number) must be dropped — only string content_ids are forwarded.
          content_ids: ['sunny', 123, 'x'.repeat(300)],
          nested: { evil: 'payload' },
          arbitrary_field: 'should be dropped',
          email: 'leak@example.com',
        },
      }),
    );

    expect(sendMetaConversionEvent).toHaveBeenCalledTimes(1);
    const call = vi.mocked(sendMetaConversionEvent).mock.calls[0][0];
    expect(call.customData).toEqual({
      value: 300,
      currency: 'USD',
      content_name: 'Sunny',
      content_ids: ['sunny', 'x'.repeat(200)],
    });
    expect(call.customData).not.toHaveProperty('nested');
    expect(call.customData).not.toHaveProperty('arbitrary_field');
    expect(call.customData).not.toHaveProperty('email');
  });

  it('drops customData entirely when it is not a plain object', async () => {
    const { sendMetaConversionEvent } = await import('@/lib/analytics/meta-conversions-api');

    await POST(
      createRequest({
        eventName: 'Contact',
        eventId: VALID_EVENT_ID,
        customData: ['not', 'an', 'object'],
      }),
    );

    const call = vi.mocked(sendMetaConversionEvent).mock.calls[0][0];
    expect(call.customData).toBeUndefined();
  });

  it('truncates an overly long sourceUrl and never logs/returns raw PII', async () => {
    const { sendMetaConversionEvent } = await import('@/lib/analytics/meta-conversions-api');
    const longUrl = `https://example.com/?${'a'.repeat(3000)}`;

    await POST(
      createRequest({ eventName: 'Contact', eventId: VALID_EVENT_ID, sourceUrl: longUrl }),
    );

    const call = vi.mocked(sendMetaConversionEvent).mock.calls[0][0];
    expect(call.eventSourceUrl?.length).toBeLessThanOrEqual(512);
  });

  it('never throws on malformed JSON and never breaks the caller', async () => {
    const response = await POST(
      new NextRequest('http://example.com/api/analytics/meta', {
        method: 'POST',
        headers: { cookie: 'exoticbulldoglegacy_consent=granted', host: 'example.com' },
        body: '{not valid json',
      }),
    );
    expect(response.status).toBe(400);
  });

  it('returns 503 without throwing when Meta rejects the event', async () => {
    const { sendMetaConversionEvent } = await import('@/lib/analytics/meta-conversions-api');
    vi.mocked(sendMetaConversionEvent).mockResolvedValueOnce(false);

    const response = await POST(createRequest({ eventName: 'Contact', eventId: VALID_EVENT_ID }));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toEqual({ accepted: false });
  });
});
