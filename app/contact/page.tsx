// New dark Contact page with hero section
import { MessageCircle, MapPin, Clock } from 'lucide-react';

import { ContactForm } from '@/components/contact-form';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ContactCards } from '@/components/contact-cards';
import { CONTACT_CARDS } from '@/lib/config/contact';
import { BUSINESS_PROFILE } from '@/lib/config/business';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Contact Exotic Bulldog Legacy',
  description:
    'Call, text, or message Exotic Bulldog Legacy to plan your French or English bulldog adoption, book kennel visits, or ask health questions.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] pb-20 font-sans text-white">
      {/* SEO - Hidden Breadcrumbs */}
      <div className="sr-only">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Contact', href: '/contact' },
          ]}
        />
      </div>

      {/* Hero Section */}
      <div className="relative px-6 pb-16 pt-32 md:px-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-full max-w-[800px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/50 px-4 py-1.5">
                <MessageCircle size={14} className="text-green-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  Concierge Service
                </span>
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
                Let&apos;s plan your <br />
                <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                  bulldog match
                </span>
              </h1>
              <p className="max-w-lg text-lg text-slate-400">
                Share a bit about your family, desired timing, and any must-have traits so we can
                recommend the right puppy.
              </p>
            </div>

            <div className="flex gap-8 pb-2 text-sm text-slate-500 lg:justify-end">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-orange-400" />
                <span>
                  {BUSINESS_PROFILE.address.addressLocality},{' '}
                  {BUSINESS_PROFILE.address.addressRegion}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-orange-400" />
                <span>9am – 7pm CT (Mon-Sat)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="mx-auto mb-24 max-w-7xl px-6 md:px-12">
        <ContactCards cards={CONTACT_CARDS} />
      </div>

      {/* Inquiry Form Section */}
      <div className="relative mx-auto max-w-5xl px-6 md:px-12">
        {/* Decorative Elements */}
        <div className="pointer-events-none absolute -left-4 top-20 h-24 w-24 rounded-full bg-blue-500 opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -right-4 bottom-20 h-32 w-32 rounded-full bg-orange-500 opacity-20 blur-3xl" />

        <div className="rounded-[2.5rem] border border-slate-700 bg-[#1E293B]/80 p-8 shadow-2xl backdrop-blur-2xl md:p-16">
          <ContactForm variant="dark" />
        </div>
      </div>
    </div>
  );
}
