"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { useAnalytics } from "@/components/analytics-provider";
import { CONTACT_CHANNELS } from "@/lib/config/contact";

type Availability = "online" | "offline" | "unknown";

export function ContactBar() {
  const [availability, setAvailability] = useState<Availability>("unknown");
  const pathname = usePathname();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    function handleAvailability(event: Event) {
      const detail = (event as CustomEvent<{ status?: Availability }>).detail;
      if (detail?.status) {
        setAvailability(detail.status);
      }
    }

    window.addEventListener("crisp:availability", handleAvailability as EventListener);

    return () => {
      window.removeEventListener("crisp:availability", handleAvailability as EventListener);
    };
  }, []);

  const availabilityLabel =
    availability === "online"
      ? "Chat is live"
      : availability === "offline"
        ? "Chat is offline"
        : "Chat connecting…";

  return (
    <aside className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-3xl -translate-x-1/2 rounded-full border border-neutral-200 bg-white/95 p-2 shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CONTACT_CHANNELS.map((contact) => (
          <a
            key={contact.label}
            href={contact.href}
            className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-300 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:text-neutral-100 dark:hover:bg-neutral-800"
            onClick={() =>
              trackEvent("contact_click", {
                channel: contact.id,
                href: contact.href,
                context_path: pathname,
              })
            }
          >
            {contact.label}
          </a>
        ))}
        <span className="hidden rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400 sm:block">
          {availabilityLabel}
        </span>
      </div>
    </aside>
  );
}
