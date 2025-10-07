import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { ContactBar } from "@/components/contact-bar";
import { ConsentBanner } from "@/components/consent-banner";
import { CrispChat } from "@/components/crisp-chat";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? null;
  const metaPixelId = process.env.META_PIXEL_ID ?? null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[var(--background)] text-[var(--foreground)] antialiased`}
      >
        <AnalyticsProvider gaMeasurementId={gaMeasurementId} metaPixelId={metaPixelId}>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1 bg-gradient-to-b from-[var(--background)] via-white to-white dark:via-neutral-950 dark:to-neutral-950">
              {children}
            </main>
            <SiteFooter />
          </div>
          <ContactBar />
          <CrispChat />
          <ConsentBanner />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
