import { createHash } from 'node:crypto';

export const META_STANDARD_EVENTS = [
  'PageView',
  'ViewContent',
  'Contact',
  'Lead',
  'InitiateCheckout',
  'Purchase',
] as const;

export type MetaStandardEvent = (typeof META_STANDARD_EVENTS)[number];

type MetaUserData = {
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  email?: string | null;
  phone?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

export type MetaConversionEvent = {
  // Meta's Conversions API accepts custom event names too (the standard/custom
  // split is an Ads Manager reporting concept, not an API restriction), so this
  // isn't narrowed to MetaStandardEvent.
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  customData?: Record<string, unknown>;
  userData?: MetaUserData;
};

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

export async function sendMetaConversionEvent(event: MetaConversionEvent): Promise<boolean> {
  // Mirrors the browser Pixel ID fallback in app/layout.tsx so CAPI resolves the
  // same Pixel ID the client-side script uses, regardless of which var is set.
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSION_API_TOKEN;
  if (!pixelId || !accessToken) return false;

  const userData = event.userData ?? {};
  const email = userData.email ? normalizeEmail(userData.email) : '';
  const phone = userData.phone ? normalizePhone(userData.phone) : '';
  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: 'website',
        user_data: {
          client_ip_address: userData.clientIpAddress || undefined,
          client_user_agent: userData.clientUserAgent || undefined,
          em: email ? [hash(email)] : undefined,
          ph: phone ? [hash(phone)] : undefined,
          fbp: userData.fbp || undefined,
          fbc: userData.fbc || undefined,
        },
        custom_data: event.customData,
      },
    ],
  };

  try {
    const version = process.env.META_GRAPH_API_VERSION || 'v23.0';
    const response = await fetch(
      `https://graph.facebook.com/${version}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    );
    if (!response.ok) {
      console.error('Meta Conversions API rejected an event', {
        eventName: event.eventName,
        status: response.status,
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error('Meta Conversions API request failed', {
      eventName: event.eventName,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}
