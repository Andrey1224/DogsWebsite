import { ContactBar } from '@/components/contact-bar';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { CONTACT_CHANNELS } from '@/lib/config/contact';

export default function ChromeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main id="main-content" className="flex-1 bg-bg">
          {children}
        </main>
        <SiteFooter />
      </div>
      <ContactBar channels={CONTACT_CHANNELS} />
    </>
  );
}
