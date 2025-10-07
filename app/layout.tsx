import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ContactBar } from "@/components/contact-bar";
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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[var(--background)] text-[var(--foreground)] antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1 bg-gradient-to-b from-[var(--background)] via-white to-white dark:via-neutral-950 dark:to-neutral-950">
            {children}
          </main>
          <SiteFooter />
        </div>
        <ContactBar />
      </body>
    </html>
  );
}
