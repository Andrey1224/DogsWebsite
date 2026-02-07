import { Geist, Geist_Mono } from 'next/font/google';
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
  const metaPixelId = process.env.META_PIXEL_ID ?? null;

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
        {/* DNS prefetch and preconnect for Supabase Storage */}
        {supabaseHostname && (
          <>
            <link rel="dns-prefetch" href={`https://${supabaseHostname}`} />
            <link rel="preconnect" href={`https://${supabaseHostname}`} crossOrigin="anonymous" />
          </>
        )}

        {/* Preconnect for analytics (GA4/GTM) - only if consent granted */}
        {gaMeasurementId && (
          <>
            <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
            <link
              rel="preconnect"
              href="https://www.googletagmanager.com"
              crossOrigin="anonymous"
            />
            <link rel="dns-prefetch" href="https://www.google-analytics.com" />
            <link
              rel="preconnect"
              href="https://www.google-analytics.com"
              crossOrigin="anonymous"
            />
          </>
        )}

        {/* Preconnect for Facebook Pixel - only if configured */}
        {metaPixelId && (
          <>
            <link rel="dns-prefetch" href="https://connect.facebook.net" />
            <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
          </>
        )}

        {/* Preconnect for Crisp Chat - reduces DNS/TLS handshake time */}
        <link rel="preconnect" href="https://client.crisp.chat" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[color:var(--bg)] text-[color:var(--text)] antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd id="organization-schema" data={organizationSchema} />
        <JsonLd id="localbusiness-schema" data={localBusinessSchema} />
        <ThemeProvider>
          <AnalyticsProvider gaMeasurementId={gaMeasurementId} metaPixelId={metaPixelId}>
            {children}
            <CrispChatLoader />
            <ConsentBanner />
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
