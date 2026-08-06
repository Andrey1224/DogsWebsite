'use client';

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

import { getMetaTrackingCommand } from '@/lib/analytics/meta-events';
import { ensureMetaPixelQueue } from '@/lib/analytics/meta-pixel';
import { getSafeUrlParts, sanitizeUrlValue } from '@/lib/analytics/safe-url';
import { stripSensitiveEventParams } from '@/lib/analytics/sensitive-params';
import type { AnalyticsIdentifiers } from '@/lib/analytics/types';

const STORAGE_KEY = 'exoticbulldoglegacy-consent';
const COOKIE_KEY = 'exoticbulldoglegacy_consent';

type ConsentState = 'unknown' | 'granted' | 'denied';

type AnalyticsContextValue = {
  consent: ConsentState;
  grantConsent: () => void;
  denyConsent: () => void;
  resetConsent: () => void;
  trackEvent: (event: string, params?: Record<string, unknown>) => void;
  getAnalyticsIdentifiers: () => Promise<AnalyticsIdentifiers>;
};

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

type AnalyticsProviderProps = {
  gaMeasurementId?: string | null;
  metaPixelId?: string | null;
  children: React.ReactNode;
};

type MetaPageViewTrackerProps = {
  consent: ConsentState;
  ready: boolean;
};

function metaCookie(name: string): string | undefined {
  const prefix = `${name}=`;
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

function createMetaEventId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function sendMetaServerEvent(
  eventName: string,
  eventId: string,
  customData?: Record<string, unknown>,
) {
  const { safeLocation } = getSafeUrlParts(window.location.href);
  void fetch('/api/analytics/meta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    keepalive: true,
    body: JSON.stringify({
      eventName,
      eventId,
      sourceUrl: safeLocation,
      customData,
      fbp: metaCookie('_fbp'),
      fbc: metaCookie('_fbc'),
    }),
  }).catch(() => {
    // Analytics must never interrupt navigation or a primary user action.
  });
}

// Dedup-eligible custom (non-standard) Meta events: fired via fbq('trackCustom', ...)
// but still paired with a server CAPI call sharing the same event_id, unlike other
// trackCustom events which remain browser-only. Must match the server allowlist in
// app/api/analytics/meta/route.ts (ALLOWED_CUSTOM_EVENTS).
const DEDUPED_CUSTOM_EVENTS = new Set(['reserve_click']);

function dispatchMetaEvent(
  method: 'track' | 'trackCustom',
  eventName: string,
  params?: Record<string, unknown>,
) {
  const eventId = createMetaEventId();
  window.fbq?.(method, eventName, params, { eventID: eventId });
  sendMetaServerEvent(eventName, eventId, params);
}

function trackMetaStandardEvent(eventName: string, params?: Record<string, unknown>) {
  dispatchMetaEvent('track', eventName, params);
}

function MetaPageViewTracker({ consent, ready }: MetaPageViewTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const pageKey = query ? `${pathname}?${query}` : pathname;
  const lastTrackedPageRef = useRef<string | null>(null);

  useEffect(() => {
    if (consent !== 'granted') {
      lastTrackedPageRef.current = null;
      return;
    }

    if (!ready || lastTrackedPageRef.current === pageKey) return;

    const { safeLocation, safePath } = getSafeUrlParts(window.location.href);
    trackMetaStandardEvent('PageView', {
      page_location: safeLocation,
      page_path: safePath,
      page_title: document.title,
    });
    lastTrackedPageRef.current = pageKey;
  }, [consent, pageKey, ready]);

  return null;
}

// ------------------------------------------------------------------------------------------------
// GA Page View Tracker
// ------------------------------------------------------------------------------------------------
function GaPageViewTracker({
  gaMeasurementId,
  gaReady,
}: {
  gaMeasurementId: string;
  gaReady: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!gaReady || typeof window.gtag !== 'function') return;
    const query = searchParams.toString();
    // pageKey is only used for React-side dedup; it is never sent to GA directly.
    const pageKey = query ? `${pathname}?${query}` : pathname;
    if (lastTrackedRef.current === pageKey) return;
    lastTrackedRef.current = pageKey;
    const { safeLocation, safePath } = getSafeUrlParts(window.location.href);
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: safeLocation,
      page_path: safePath,
    });
  }, [pathname, searchParams, gaReady, gaMeasurementId]);

  return null;
}

// ------------------------------------------------------------------------------------------------
// Allowlist for cookieless GA4 events
// ------------------------------------------------------------------------------------------------
const ALLOWED_COOKIELESS_PARAMS = new Set([
  'page_path',
  'page_location',
  'page_title',
  'content_type',
  'content_name',
  'puppy_slug',
  'breed',
  'method',
  'location',
  'context_path',
  'currency',
  'value',
]);

/** Sanitizes URL-shaped event fields in place; a no-op for events that don't carry them. */
function sanitizeUrlFields(params?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const result = { ...params };
  if (typeof result.page_location === 'string') {
    result.page_location = getSafeUrlParts(result.page_location).safeLocation;
  }
  if (typeof result.page_path === 'string') {
    result.page_path = sanitizeUrlValue(result.page_path);
  }
  if (typeof result.context_path === 'string') {
    result.context_path = sanitizeUrlValue(result.context_path);
  }
  return result;
}

function filterCookielessParams(
  params?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const allowlisted = Object.fromEntries(
    Object.entries(params).filter(([k]) => ALLOWED_COOKIELESS_PARAMS.has(k)),
  );
  return sanitizeUrlFields(allowlisted);
}

// ------------------------------------------------------------------------------------------------

function persistConsent(consent: ConsentState) {
  if (consent === 'unknown') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, consent);
  } catch (error) {
    console.warn('Failed to persist consent to localStorage', error);
  }

  const ttl = 365 * 24 * 60 * 60;
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_KEY}=${consent}; path=/; max-age=${ttl}; SameSite=Lax`;
    // Add data attribute for test verification
    document.documentElement.setAttribute('data-consent', consent);
  }
}

function readStoredConsent(): ConsentState {
  if (typeof window === 'undefined') {
    return 'unknown';
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'granted' || stored === 'denied') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read consent from localStorage', error);
  }
  return 'unknown';
}

export function AnalyticsProvider({
  gaMeasurementId,
  metaPixelId,
  children,
}: AnalyticsProviderProps) {
  const [consent, setConsent] = useState<ConsentState>('unknown');
  const [metaReady, setMetaReady] = useState(false);
  const [gaReady, setGaReady] = useState(false);
  const pixelLoadedRef = useRef(false);
  const gaScriptLoadedRef = useRef(false);

  useEffect(() => {
    const storedConsent = readStoredConsent();
    setConsent(storedConsent);
    // Set data attribute on initial load for test verification
    if (storedConsent !== 'unknown' && typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-consent', storedConsent);
    }
  }, []);

  useEffect(() => {
    if (consent === 'unknown') return;
    persistConsent(consent);

    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics: Consent status changed:', consent);
    }
  }, [consent]);

  useEffect(() => {
    if (!gaMeasurementId || typeof window.gtag !== 'function') return;

    if (consent === 'granted') {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics: GA4 consent granted', { gaMeasurementId });
      }
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    } else if (consent === 'denied') {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics: GA4 consent denied');
      }
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
  }, [consent, gaMeasurementId]);

  useEffect(() => {
    if (!metaPixelId) return;

    if (consent === 'granted' && pixelLoadedRef.current) {
      window.fbq?.('consent', 'grant');
      setMetaReady(true);
    } else if (consent === 'granted') {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics: Meta Pixel consent granted', { metaPixelId });
      }

      // Initialize placeholder if fbq doesn't exist
      if (!window.fbq) {
        ensureMetaPixelQueue();
      }

      // The actual script will be loaded by next/script below
      // We just initialize here after the script loads via onLoad callback
    }

    if (consent === 'denied' && pixelLoadedRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics: Meta Pixel consent denied');
      }
      window.fbq?.('consent', 'revoke');
      setMetaReady(false);
    }
  }, [consent, metaPixelId]);

  const grantConsent = useCallback(() => setConsent('granted'), []);
  const denyConsent = useCallback(() => setConsent('denied'), []);

  const resetConsent = useCallback(() => {
    if (gaMeasurementId && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    }
    window.fbq?.('consent', 'revoke');
    setMetaReady(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear consent from localStorage', error);
    }
    if (typeof document !== 'undefined') {
      document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
      document.documentElement.removeAttribute('data-consent');
    }
    setConsent('unknown');
  }, [gaMeasurementId]);

  const getAnalyticsIdentifiers = useCallback(async (): Promise<AnalyticsIdentifiers> => {
    if (consent !== 'granted' || !gaMeasurementId || typeof window.gtag !== 'function') {
      return {};
    }

    const getValue = (field: 'client_id' | 'session_id') =>
      new Promise<string | undefined>((resolve) => {
        let settled = false;
        const timeoutId = window.setTimeout(() => {
          if (settled) return;
          settled = true;
          resolve(undefined);
        }, 500);

        window.gtag?.('get', gaMeasurementId, field, (value) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          resolve(value === undefined || value === null ? undefined : String(value));
        });
      });

    const [clientId, sessionId] = await Promise.all([
      getValue('client_id'),
      getValue('session_id'),
    ]);

    return { clientId, sessionId };
  }, [consent, gaMeasurementId]);

  const trackEvent = useCallback(
    (event: string, params?: Record<string, unknown>) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('📈 Analytics: trackEvent called', { event, params, consent });
      }

      // GA4: send to cookieless when unknown/denied, full when granted.
      // Consent never authorizes raw form input or identifiers — strip those either way.
      // Only send if GA has been initialized (gtag function exists)
      if (gaMeasurementId && typeof window.gtag === 'function') {
        if (consent === 'granted') {
          window.gtag('event', event, stripSensitiveEventParams(sanitizeUrlFields(params)));
        } else {
          // Cookieless: only allowlisted params
          const safeParams = filterCookielessParams(params);
          window.gtag('event', event, safeParams);
        }
      }

      // Meta: only when granted
      if (consent !== 'granted') return;
      const metaCommand = getMetaTrackingCommand(event, params);
      const safeMetaParams = stripSensitiveEventParams(metaCommand.params);
      if (metaCommand.method === 'track') {
        trackMetaStandardEvent(metaCommand.name, safeMetaParams);
      } else if (DEDUPED_CUSTOM_EVENTS.has(metaCommand.name)) {
        dispatchMetaEvent('trackCustom', metaCommand.name, safeMetaParams);
      } else {
        window.fbq?.(metaCommand.method, metaCommand.name, safeMetaParams);
      }
    },
    [consent, gaMeasurementId],
  );

  const value = useMemo(
    () => ({
      consent,
      grantConsent,
      denyConsent,
      resetConsent,
      trackEvent,
      getAnalyticsIdentifiers,
    }),
    [consent, grantConsent, denyConsent, resetConsent, getAnalyticsIdentifiers, trackEvent],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {gaMeasurementId ? (
        <>
          <Script
            id="ga-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `gtag('js', new Date()); gtag('config', '${gaMeasurementId}', { send_page_view: false });`,
            }}
          />
          <Script
            id="ga-gtag"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
            onLoad={() => {
              if (process.env.NODE_ENV === 'development') {
                console.log('📊 Analytics: GA4 script loaded successfully', { gaMeasurementId });
              }
              gaScriptLoadedRef.current = true;
              setGaReady(true);
            }}
          />
        </>
      ) : null}

      {consent === 'granted' && metaPixelId ? (
        <>
          <Script
            id="fb-pixel"
            src="https://connect.facebook.net/en_US/fbevents.js"
            strategy="lazyOnload"
            onLoad={() => {
              if (process.env.NODE_ENV === 'development') {
                console.log('📊 Analytics: Meta Pixel script loaded');
              }
              if (!pixelLoadedRef.current) {
                window.fbq?.('init', metaPixelId);
              }
              window.fbq?.('consent', 'grant');
              pixelLoadedRef.current = true;
              setMetaReady(true);
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      ) : null}

      {gaMeasurementId ? (
        <Suspense fallback={null}>
          <GaPageViewTracker gaMeasurementId={gaMeasurementId} gaReady={gaReady} />
        </Suspense>
      ) : null}

      <Suspense fallback={null}>
        <MetaPageViewTracker consent={consent} ready={metaReady} />
      </Suspense>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}
