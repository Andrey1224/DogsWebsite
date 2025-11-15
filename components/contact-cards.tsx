'use client';

import { usePathname } from 'next/navigation';

import { useAnalytics } from '@/components/analytics-provider';
import type { ContactCard } from '@/lib/config/contact';

type ContactCardsProps = {
  cards: ContactCard[];
};

export function ContactCards({ cards }: ContactCardsProps) {
  const { trackEvent } = useAnalytics();
  const pathname = usePathname();

  return (
    <section className="grid gap-6 sm:grid-cols-2">
      {cards.map((channel) => (
        <article
          key={channel.id}
          className="rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-sm font-semibold text-muted">{channel.label}</p>
          <a
            href={channel.href}
            className="mt-2 block text-lg font-semibold text-accent-aux hover:opacity-80"
            onClick={() =>
              trackEvent('contact_click', {
                channel: channel.id,
                href: channel.href,
                context_path: pathname,
              })
            }
          >
            {channel.value}
          </a>
          <p className="mt-3 text-sm text-muted">{channel.description}</p>
        </article>
      ))}
    </section>
  );
}
