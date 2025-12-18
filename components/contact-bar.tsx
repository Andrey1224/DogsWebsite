// New Sticky Action Bar with 5 contact channels and CTA button
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Mail, Send } from 'lucide-react';

import { useAnalytics } from '@/components/analytics-provider';
import type { ContactChannel } from '@/lib/config/contact';

// Map contact channel IDs to lucide-react icons
const channelIcons = {
  call: Phone,
  sms: MessageCircle,
  whatsapp: MessageCircle,
  telegram: Send,
  email: Mail,
};

type ContactBarProps = {
  channels: ContactChannel[];
};

export function ContactBar({ channels }: ContactBarProps) {
  const pathname = usePathname();
  const { trackEvent } = useAnalytics();

  return (
    <aside className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-2xl -translate-x-1/2">
      <div className="flex items-center justify-between rounded-full border border-slate-600/50 bg-[#1E293B]/80 p-2 pl-6 shadow-2xl backdrop-blur-xl">
        <span className="hidden text-sm font-medium text-slate-300 sm:block">Questions?</span>

        <div className="flex w-full items-center justify-between gap-1 sm:w-auto sm:justify-end">
          {channels.map((contact) => {
            const Icon = channelIcons[contact.id as keyof typeof channelIcons];
            const label = contact.label === 'SMS' ? 'Text' : contact.label;

            return (
              <a
                key={contact.id}
                href={contact.href}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                onClick={() =>
                  trackEvent('contact_click', {
                    channel: contact.id,
                    href: contact.href,
                    context_path: pathname,
                  })
                }
                aria-label={contact.label}
              >
                {Icon && <Icon size={16} />}
                <span className="hidden md:inline">{label}</span>
              </a>
            );
          })}

          <Link
            href="/contact"
            className="ml-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-orange-500/20"
          >
            Let&apos;s Connect
          </Link>
        </div>
      </div>
    </aside>
  );
}
