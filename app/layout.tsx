import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { ConsentBanner } from '@/components/consent-banner';
import { CrispChatLoader } from '@/components/crisp-chat-loader';
import { JsonLd } from '@/components/json-ld';
import { ThemeProvider } from '@/components/theme-provider';
import {
  validateDevelopmentEnvironment,
  validateProductionEnvironment,
} from '@/lib/env-validation';
import { getDefaultMetadata } from '@/lib/seo/metadata';
import { getLocalBusinessSchema, getOrganizationSchema } from '@/lib/seo/structured-data';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = getDefaultMetadata();
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Environment validation
if (process.env.NODE_ENV === 'development') {
  validateDevelopmentEnvironment();
} else if (process.env.NODE_ENV === 'production') {
  validateProductionEnvironment();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? process.env.META_PIXEL_ID ?? null;
  const crispEnabled =
    process.env.NEXT_PUBLIC_CRISP_ENABLED === 'true' &&
    Boolean(process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID);

  const gaBootstrapScript = gaMeasurementId
    ? `
    (function() {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };
      var savedConsent = 'denied';
      try {
        var stored = window.localStorage.getItem('exoticbulldoglegacy-consent');
        if (stored === 'granted') { savedConsent = 'granted'; }
      } catch(e) {}
      window.gtag('consent', 'default', {
        analytics_storage: savedConsent === 'granted' ? 'granted' : 'denied',
        ad_storage: savedConsent === 'granted' ? 'granted' : 'denied',
        ad_user_data: savedConsent === 'granted' ? 'granted' : 'denied',
        ad_personalization: savedConsent === 'granted' ? 'granted' : 'denied',
        wait_for_update: 500
      });
    })();
  `
    : null;

  const themeScript = `
    (function() {
      try {
        var storageKey = '${'puppy-theme-preference'}';
        var stored = window.localStorage.getItem(storageKey);
        var preference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
        var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
        document.documentElement.setAttribute('data-theme', resolved);
      } catch (error) {
        // ignore init errors
      }
    })();
  `;

  const organizationSchema = getOrganizationSchema();
  const localBusinessSchema = getLocalBusinessSchema();

  const supabaseHostname = process.env.SUPABASE_URL
    ? new URL(process.env.SUPABASE_URL).hostname
    : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Site Verification */}
        <meta
          name="google-site-verification"
          content="QcntDgPQ0XvZFNEmE-y70IfO97-6me0KEriMcwaQHf0"
        />

        {/* DNS prefetch and preconnect for Supabase Storage */}
        {supabaseHostname && (
          <>
            <link rel="dns-prefetch" href={`https://${supabaseHostname}`} />
            <link rel="preconnect" href={`https://${supabaseHostname}`} crossOrigin="anonymous" />
          </>
        )}

        {crispEnabled && (
          <link rel="preconnect" href="https://client.crisp.chat" crossOrigin="anonymous" />
        )}

        {gaBootstrapScript && <script dangerouslySetInnerHTML={{ __html: gaBootstrapScript }} />}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[color:var(--bg)] text-[color:var(--text)] antialiased`}
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd id="organization-schema" data={organizationSchema} />
        <JsonLd id="localbusiness-schema" data={localBusinessSchema} />
        <ThemeProvider>
          <AnalyticsProvider gaMeasurementId={gaMeasurementId} metaPixelId={metaPixelId}>
            {children}
            {crispEnabled && <CrispChatLoader />}
            <ConsentBanner />
          </AnalyticsProvider>
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
