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
import type { AnalyticsIdentifiers } from '@/lib/analytics/types';

const STORAGE_KEY = 'exoticbulldoglegacy-consent';
const COOKIE_KEY = 'exoticbulldoglegacy_consent';

type ConsentState = 'unknown' | 'granted' | 'denied';

type AnalyticsContextValue = {
  consent: ConsentState;
  grantConsent: () => void;
  denyConsent: () => void;
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
  void fetch('/api/analytics/meta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    keepalive: true,
    body: JSON.stringify({
      eventName,
      eventId,
      sourceUrl: window.location.href,
      customData,
      fbp: metaCookie('_fbp'),
      fbc: metaCookie('_fbc'),
    }),
  }).catch(() => {
    // Analytics must never interrupt navigation or a primary user action.
  });
}

function trackMetaStandardEvent(eventName: string, params?: Record<string, unknown>) {
  const eventId = createMetaEventId();
  window.fbq?.('track', eventName, params, { eventID: eventId });
  sendMetaServerEvent(eventName, eventId, params);
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

    trackMetaStandardEvent('PageView', {
      page_location: window.location.href,
      page_path: pageKey,
      page_title: document.title,
    });
    lastTrackedPageRef.current = pageKey;
  }, [consent, pageKey, ready]);

  return null;
}

function persistConsent(consent: ConsentState) {
  if (consent === 'unknown') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, consent);
  } catch (error) {
    console.warn('Failed to persist consent to localStorage', error);
  }

  const ttl = 365 * 24 * 60 * 60;
  document.cookie = `${COOKIE_KEY}=${consent}; path=/; max-age=${ttl}; SameSite=Lax`;

  // Add data attribute for test verification
  document.documentElement.setAttribute('data-consent', consent);
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
  const pixelLoadedRef = useRef(false);

  useEffect(() => {
    const storedConsent = readStoredConsent();
    setConsent(storedConsent);
    // Set data attribute on initial load for test verification
    if (storedConsent !== 'unknown') {
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
    if (!gaMeasurementId) return;

    if (consent === 'granted' && typeof window.gtag === 'function') {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics: GA4 consent granted', { gaMeasurementId });
      }
      window.gtag('consent', 'update', {
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      });
    }

    if (consent === 'denied' && typeof window.gtag === 'function') {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics: GA4 consent denied');
      }
      window.gtag('consent', 'update', {
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
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

      if (consent !== 'granted') {
        if (process.env.NODE_ENV === 'development') {
          console.log('📈 Analytics: Event blocked - consent not granted');
        }
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('📈 Analytics: Event fired', { event, params });
      }

      window.gtag?.('event', event, params);

      const metaCommand = getMetaTrackingCommand(event, params);
      if (metaCommand.method === 'track') {
        trackMetaStandardEvent(metaCommand.name, metaCommand.params);
      } else {
        window.fbq?.(metaCommand.method, metaCommand.name, metaCommand.params);
      }
    },
    [consent],
  );

  const value = useMemo(
    () => ({
      consent,
      grantConsent,
      denyConsent,
      trackEvent,
      getAnalyticsIdentifiers,
    }),
    [consent, grantConsent, denyConsent, getAnalyticsIdentifiers, trackEvent],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {consent === 'granted' && gaMeasurementId ? (
        <>
          <Script
            id="ga-gtag"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="lazyOnload"
            onLoad={() => {
              if (process.env.NODE_ENV === 'development') {
                console.log('📊 Analytics: GA4 script loaded successfully', { gaMeasurementId });
              }
            }}
          />
          <Script
            id="ga-init"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaMeasurementId}');`,
            }}
            onLoad={() => {
              if (process.env.NODE_ENV === 'development') {
                console.log('📊 Analytics: GA4 initialized', { gaMeasurementId });
              }
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
