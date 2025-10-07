"use client";

import { usePathname } from "next/navigation";

import { useAnalytics } from "@/components/analytics-provider";
import type { ContactCard } from "@/lib/config/contact";

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
          className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900/80"
        >
          <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">{channel.label}</p>
          <a
            href={channel.href}
            className="mt-2 block text-lg font-semibold text-emerald-600 hover:underline"
            onClick={() =>
              trackEvent("contact_click", {
                channel: channel.id,
                href: channel.href,
                context_path: pathname,
              })
            }
          >
            {channel.value}
          </a>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">{channel.description}</p>
        </article>
      ))}
    </section>
  );
}
