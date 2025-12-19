// New Sticky Action Bar with 5 contact channels and CTA button
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, MessageSquare, Mail, Send } from 'lucide-react';

import { useAnalytics } from '@/components/analytics-provider';
import type { ContactChannel } from '@/lib/config/contact';

// Map contact channel IDs to lucide-react icons
const channelIcons = {
  call: Phone,
  sms: MessageSquare, // Square bubble for SMS
  whatsapp: MessageCircle, // Round bubble for WhatsApp
  telegram: Send,
  email: Mail,
};

type ContactBarProps = {
  channels: ContactChannel[];
};

declare global {
  interface Window {
    $crisp?: unknown[];
  }
}

export function ContactBar({ channels }: ContactBarProps) {
  const pathname = usePathname();
  const { trackEvent } = useAnalytics();

  const openLiveChat = () => {
    trackEvent('contact_click', {
      channel: 'live_chat_mobile',
      context_path: pathname,
    });

    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:show']);
      window.$crisp.push(['do', 'chat:open']);
      return;
    }

    // Force load/open if not ready
    window.dispatchEvent(new Event('crisp:open'));
  };

  return (
    <aside className="fixed bottom-6 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2">
      <div className="flex items-center justify-between rounded-full border border-slate-600/50 bg-[#1E293B]/80 p-1.5 pl-3 pr-1.5 shadow-2xl backdrop-blur-xl sm:gap-4 sm:justify-start sm:py-2 sm:pl-6 sm:pr-10">
        <span className="hidden text-sm font-medium text-slate-300 sm:block">Questions?</span>

        <div className="flex w-full items-center justify-between gap-0.5 sm:w-auto sm:flex-1 sm:justify-end sm:gap-1">
          {channels.map((contact) => {
            const Icon = channelIcons[contact.id as keyof typeof channelIcons];
            const label = contact.label === 'SMS' ? 'Text' : contact.label;

            return (
              <a
                key={contact.id}
                href={contact.href}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white sm:px-4 sm:py-2"
                onClick={() =>
                  trackEvent('contact_click', {
                    channel: contact.id,
                    href: contact.href,
                    context_path: pathname,
                  })
                }
                aria-label={contact.label}
              >
                {Icon && <Icon className="size-3.5 sm:size-4" />}
                <span className="hidden md:inline">{label}</span>
              </a>
            );
          })}

          {/* Desktop: Link to contact page */}
          <Link
            href="/contact"
            className="hidden shrink-0 sm:inline-block sm:ml-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-orange-500/20"
          >
            Let&apos;s Connect
          </Link>

          {/* Mobile: Direct Chat Trigger */}
          <button
            type="button"
            onClick={openLiveChat}
            className="sm:hidden ml-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-1.5 text-xs font-bold text-white transition-all hover:shadow-lg hover:shadow-orange-500/20 sm:px-6 sm:py-2.5 sm:text-sm"
          >
            Let&apos;s Chat
          </button>
        </div>
      </div>
    </aside>
  );
}
