// New dark footer UI with 4-column layout and integrated map
import Link from 'next/link';
import {
  Instagram,
  Send,
  MessageCircle,
  Clock,
  ArrowUpRight,
  MapPin,
  Navigation,
} from 'lucide-react';

import { CONTACT_DETAILS } from '@/lib/config/contact';
import { BUSINESS_PROFILE } from '@/lib/config/business';

const locationHours = BUSINESS_PROFILE.hours;
const mapSrc = BUSINESS_PROFILE.mapEmbedUrl;
const cityState = `${BUSINESS_PROFILE.address.addressLocality}, ${BUSINESS_PROFILE.address.addressRegion}`;
const publicCityState = `${cityState} (by appointment)`;
const phoneDisplay = CONTACT_DETAILS.phone.display;
const phoneHref = `tel:${CONTACT_DETAILS.phone.e164}`;

function formatTimeTo12Hour(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

const footerLinks = [
  {
    title: 'Explore',
    items: [
      { label: 'Available Puppies', href: '/puppies' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'Our Story', href: '/about' },
      { label: 'Health Policy', href: '/policies' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Deposit Terms', href: '/policies' },
      { label: 'Flight Nanny Info', href: '/policies#delivery' },
    ],
  },
];

const SocialButton = ({
  icon: Icon,
  label,
  href,
}: {
  icon: typeof Instagram;
  label: string;
  href: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="group flex h-10 w-10 items-center justify-center rounded-full bg-[#1E293B] text-slate-400 transition-all duration-300 hover:bg-orange-500 hover:text-white"
    title={label}
    aria-label={label}
  >
    <Icon size={18} />
  </a>
);

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-800 bg-[#0B1120] pb-32 pt-20 font-sans text-white">
      {/* Background Decor */}
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-blue-900/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-20 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand Column (4 cols) */}
          <div className="space-y-6 lg:col-span-4">
            <h2 className="text-2xl font-bold tracking-tight">Exotic Bulldog Legacy</h2>
            <p className="max-w-sm leading-relaxed text-slate-400">
              Responsible French & English bulldog breeding in Alabama with health-first practices,
              transparent pedigrees, and concierge support.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialButton
                icon={Instagram}
                label="Instagram"
                href={CONTACT_DETAILS.instagram.link}
              />
              <SocialButton icon={Send} label="Telegram" href={CONTACT_DETAILS.telegram.link} />
              <SocialButton
                icon={MessageCircle}
                label="WhatsApp"
                href={CONTACT_DETAILS.whatsapp.link}
              />
            </div>
          </div>

          {/* Links Columns (2 cols each) */}
          {footerLinks.map((section) => (
            <div key={section.title} className="lg:col-span-2">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-orange-400">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
                    >
                      <span className="h-1 w-1 rounded-full bg-slate-600 transition-colors group-hover:bg-orange-500"></span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Hours & Visit (4 cols) */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800/50 bg-[#151e32] p-6 lg:col-span-4">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-orange-500/10 blur-2xl" />

            <div className="mb-6 flex items-center gap-2">
              <Clock size={18} className="text-orange-400" />
              <h3 className="font-bold">Kennel Hours (Central Time)</h3>
            </div>

            <div className="mb-6 space-y-3 text-sm">
              {locationHours.map((entry) => {
                const isToday =
                  new Date().toLocaleDateString('en-US', { weekday: 'long' }) === entry.day;
                const isClosed = entry.opens === '00:00' && entry.closes === '00:00';

                return (
                  <div
                    key={entry.day}
                    className="flex justify-between border-b border-slate-800/50 pb-2 text-slate-400 last:border-0"
                  >
                    <span className={isToday ? 'font-semibold text-white' : ''}>{entry.day}</span>
                    <span className={isClosed ? 'text-slate-600' : 'text-white'}>
                      {isClosed
                        ? 'Closed'
                        : `${formatTimeTo12Hour(entry.opens)} – ${formatTimeTo12Hour(entry.closes)}`}
                    </span>
                  </div>
                );
              })}
            </div>

            <Link
              href="/contact"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0B1120] py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Schedule a Visit <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {/* Map Section */}
        <div className="group relative h-64 overflow-hidden rounded-[2rem] border border-slate-800 md:h-80">
          {/* Map Iframe */}
          <iframe
            src={mapSrc}
            title="Exotic Bulldog Legacy location"
            loading="lazy"
            allowFullScreen
            className="h-full w-full border-0 opacity-60 grayscale transition-opacity duration-500 group-hover:opacity-80 group-hover:grayscale-0"
          />

          {/* Overlay Card */}
          <div className="absolute bottom-6 left-6 max-w-xs rounded-2xl border border-slate-700 bg-[#0B1120]/90 p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-500 p-2 text-white">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white">Exotic Bulldog Legacy</h4>
                <p className="mt-1 text-xs text-slate-300">{publicCityState}</p>
                <p className="mt-2 text-xs text-slate-400">
                  <Link href={phoneHref} className="font-semibold text-orange-300 hover:underline">
                    Call: {phoneDisplay}
                  </Link>
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Street address shared after deposit for safety. Pickup in {cityState}; vetted
                  delivery available.
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-orange-400">
                  <Link
                    href={BUSINESS_PROFILE.directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    Get directions to pickup <Navigation size={10} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} Exotic Bulldog Legacy. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/policies" className="hover:text-slate-300">
              Privacy Policy
            </Link>
            <Link href="/policies" className="hover:text-slate-300">
              Terms of Service
            </Link>
            <Link href="/sitemap.xml" className="hover:text-slate-300">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
