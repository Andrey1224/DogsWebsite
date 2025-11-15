import Link from 'next/link';

import { CONTACT_DETAILS } from '@/lib/config/contact';
import { BUSINESS_PROFILE } from '@/lib/config/business';

const locationHours = BUSINESS_PROFILE.hours;
const mapSrc = BUSINESS_PROFILE.mapEmbedUrl;

function formatTimeTo12Hour(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-footer py-14">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-8">
          <div>
            <p className="font-serif text-lg font-semibold tracking-tight text-text">
              Exotic Bulldog Legacy
            </p>
            <p className="mt-3 max-w-md text-sm text-muted">
              Responsible French & English bulldog breeding in Alabama with health-first practices,
              transparent pedigrees, and concierge support before and after placement.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-semibold uppercase tracking-wide text-xs text-muted">Visit</p>
              <address className="mt-2 not-italic text-sm leading-relaxed text-text">
                {BUSINESS_PROFILE.address.streetAddress}
                <br />
                {BUSINESS_PROFILE.address.addressLocality}, {BUSINESS_PROFILE.address.addressRegion}{' '}
                {BUSINESS_PROFILE.address.postalCode}
              </address>
              <p className="mt-2 text-xs text-muted">Appointments scheduled by request only.</p>
              <div className="mt-2 text-sm">
                <Link
                  href={BUSINESS_PROFILE.directionsUrl}
                  className="text-accent-aux underline-offset-4 transition hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions
                </Link>
              </div>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-xs text-muted">Connect</p>
              <ul className="mt-2 space-y-2 text-sm">
                <li>
                  <a
                    className="transition hover:text-accent-aux"
                    href={`tel:${CONTACT_DETAILS.phone.e164}`}
                  >
                    {CONTACT_DETAILS.phone.display}
                  </a>
                </li>
                <li>
                  <a
                    className="transition hover:text-accent-aux"
                    href={`mailto:${CONTACT_DETAILS.email.address}`}
                  >
                    {CONTACT_DETAILS.email.address}
                  </a>
                </li>
                <li>
                  <a
                    className="transition hover:text-accent-aux"
                    href={CONTACT_DETAILS.whatsapp.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    className="transition hover:text-accent-aux"
                    href={CONTACT_DETAILS.telegram.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Telegram
                  </a>
                </li>
                <li>
                  <a
                    className="transition hover:text-accent-aux"
                    href="https://instagram.com/exoticbulldoglevel"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide text-xs text-muted">
              Hours (Central Time)
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {locationHours.map((entry) => (
                <li key={entry.day} className="flex justify-between gap-4 text-text">
                  <span>{entry.day}</span>
                  <span className="text-muted">
                    {formatTimeTo12Hour(entry.opens)} – {formatTimeTo12Hour(entry.closes)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-3xl border border-border shadow-sm">
            <iframe
              src={mapSrc}
              title="Exotic Bulldog Legacy location"
              loading="lazy"
              allowFullScreen
              className="h-64 w-full border-0"
            />
          </div>
          <p className="text-xs text-muted">
            Service area: Alabama, Georgia, Florida, Tennessee. Travel logistics available via
            ground couriers or flight nannies.
          </p>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl px-6 text-xs text-muted">
        © {new Date().getFullYear()} Exotic Bulldog Legacy. All rights reserved.
      </div>
    </footer>
  );
}
