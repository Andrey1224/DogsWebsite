'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Script from 'next/script';

const STORAGE_KEY = 'exoticbulldoglegacy-consent';
const COOKIE_KEY = 'exoticbulldoglegacy_consent';

type ConsentState = 'unknown' | 'granted' | 'denied';

type AnalyticsContextValue = {
  consent: ConsentState;
  grantConsent: () => void;
  denyConsent: () => void;
  trackEvent: (event: string, params?: Record<string, unknown>) => void;
};

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

type AnalyticsProviderProps = {
  gaMeasurementId?: string | null;
  metaPixelId?: string | null;
  children: React.ReactNode;
};

type FacebookPixel = NonNullable<Window['fbq']>;
type FbqCommand = Parameters<FacebookPixel>;

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

    if (consent === 'granted' && !pixelLoadedRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics: Meta Pixel consent granted', { metaPixelId });
      }

      let fbq = window.fbq;

      if (!fbq) {
        const placeholder: FacebookPixel = ((...args: FbqCommand) => {
          (placeholder.queue ||= []).push(args);
        }) as FacebookPixel;
        placeholder.queue = [];
        placeholder.loaded = false;
        placeholder.version = '2.0';
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(script);

        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Analytics: Meta Pixel script loaded');
        }

        window.fbq = placeholder;
        fbq = placeholder;
      }

      fbq?.('init', metaPixelId);
      fbq?.('consent', 'grant');
      fbq?.('track', 'PageView');
      pixelLoadedRef.current = true;
    }

    if (consent === 'denied' && pixelLoadedRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Analytics: Meta Pixel consent denied');
      }
      window.fbq?.('consent', 'revoke');
    }
  }, [consent, metaPixelId]);

  const grantConsent = useCallback(() => setConsent('granted'), []);
  const denyConsent = useCallback(() => setConsent('denied'), []);

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
      window.fbq?.('trackCustom', event, params);
    },
    [consent],
  );

  const value = useMemo(
    () => ({
      consent,
      grantConsent,
      denyConsent,
      trackEvent,
    }),
    [consent, grantConsent, denyConsent, trackEvent],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {consent === 'granted' && gaMeasurementId ? (
        <>
          <Script
            id="ga-gtag"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
            onLoad={() => {
              if (process.env.NODE_ENV === 'development') {
                console.log('📊 Analytics: GA4 script loaded successfully', { gaMeasurementId });
              }
            }}
          />
          <Script
            id="ga-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaMeasurementId}', { send_page_view: false });`,
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
      ) : null}
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
