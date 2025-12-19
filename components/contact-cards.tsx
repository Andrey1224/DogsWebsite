// New dark contact cards with copy-to-clipboard functionality
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MessageCircle, Copy, Check } from 'lucide-react';

import { useAnalytics } from '@/components/analytics-provider';
import type { ContactCard } from '@/lib/config/contact';

type ContactCardsProps = {
  cards: ContactCard[];
};

// Map contact card IDs to icons and colors
const CARD_STYLES = {
  call: {
    icon: Phone,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-400/10',
  },
  whatsapp: {
    icon: MessageCircle,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-400/10',
  },
  email: {
    icon: Mail,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-400/10',
  },
} as const;

function ContactMethodCard({ card }: { card: ContactCard }) {
  const [copied, setCopied] = useState(false);
  const { trackEvent } = useAnalytics();
  const pathname = usePathname();

  const style = CARD_STYLES[card.id as keyof typeof CARD_STYLES] || CARD_STYLES.call;
  const Icon = style.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(card.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    trackEvent('contact_copy', {
      channel: card.id,
      value: card.value,
      context_path: pathname,
    });
  };

  const handleActionClick = () => {
    trackEvent('contact_click', {
      channel: card.id,
      href: card.href,
      context_path: pathname,
    });
  };

  const actionLabel =
    card.id === 'call' ? 'Call Now' : card.id === 'whatsapp' ? 'Chat on WhatsApp' : 'Send Email';

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-slate-800 bg-[#151e32] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-900/5">
      <div className="pointer-events-none absolute -mr-16 -mt-16 right-0 top-0 h-32 w-32 rounded-full bg-white/5 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-[#0B1120] transition-transform group-hover:scale-110">
        <Icon className={style.iconColor} size={24} />
      </div>

      <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
      <div className="mb-2 text-2xl font-bold text-white break-words">{card.value}</div>
      <p className="mb-8 text-sm leading-relaxed text-slate-500">{card.description}</p>

      <div className="flex gap-3">
        <a
          href={card.href}
          onClick={handleActionClick}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-500 hover:text-white"
        >
          {actionLabel}
        </a>
        <button
          onClick={handleCopy}
          className="rounded-xl border border-slate-700 px-4 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
          title="Copy to clipboard"
          aria-label="Copy to clipboard"
        >
          {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
          <span className="sr-only">Copy contact info</span>
        </button>
      </div>
    </article>
  );
}

export function ContactCards({ cards }: ContactCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <ContactMethodCard key={card.id} card={card} />
      ))}
    </section>
  );
}
