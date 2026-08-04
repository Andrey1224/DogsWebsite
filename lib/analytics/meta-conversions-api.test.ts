import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sendMetaConversionEvent } from './meta-conversions-api';

describe('sendMetaConversionEvent', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '123456');
    vi.stubEnv('META_CONVERSION_API_TOKEN', 'secret-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('does not call Meta when server credentials are absent', async () => {
    vi.stubEnv('META_CONVERSION_API_TOKEN', '');

    await expect(
      sendMetaConversionEvent({ eventName: 'Contact', eventId: 'event-123' }),
    ).resolves.toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('hashes normalized customer data and sends a deduplication event ID', async () => {
    await expect(
      sendMetaConversionEvent({
        eventName: 'Lead',
        eventId: 'lead-123456',
        eventSourceUrl: 'https://exoticbulldoglegacy.com/contact',
        userData: { email: ' Test@Example.COM ', phone: '+1 (205) 555-1212' },
      }),
    ).resolves.toBe(true);

    const [, request] = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(String(request?.body));
    expect(payload.data[0]).toMatchObject({
      event_name: 'Lead',
      event_id: 'lead-123456',
      action_source: 'website',
    });
    expect(payload.data[0].user_data.em).toEqual([
      createHash('sha256').update('test@example.com').digest('hex'),
    ]);
    expect(payload.data[0].user_data.ph).toEqual([
      createHash('sha256').update('12055551212').digest('hex'),
    ]);
    expect(String(request?.body)).not.toContain('secret-token');
    expect(String(request?.body)).not.toContain('test@example.com');
  });
});
