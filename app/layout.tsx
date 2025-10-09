import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { ContactBar } from "@/components/contact-bar";
import { ConsentBanner } from "@/components/consent-banner";
import { CrispChat } from "@/components/crisp-chat";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { validateDevelopmentEnvironment, validateProductionEnvironment } from "@/lib/env-validation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exotic Bulldog Level",
  description:
    "Sprint workspace for the Exotic Bulldog Level landing experience built with Next.js 15.",
};

// Environment validation
if (process.env.NODE_ENV === "development") {
  validateDevelopmentEnvironment();
} else if (process.env.NODE_ENV === "production") {
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
        var storageKey = '${"puppy-theme-preference"}';
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

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[color:var(--bg)] text-[color:var(--text)] antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <AnalyticsProvider gaMeasurementId={gaMeasurementId} metaPixelId={metaPixelId}>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1 bg-bg">
                {children}
              </main>
              <SiteFooter />
            </div>
            <ContactBar />
            <CrispChat />
            <ConsentBanner />
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
