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
    <aside className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-3xl -translate-x-1/2 rounded-full border border-border bg-card/95 p-2 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {CONTACT_CHANNELS.map((contact) => (
          <a
            key={contact.label}
            href={contact.href}
            className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-border hover:bg-[color:var(--hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-aux"
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
        <span className="hidden rounded-full border border-border px-3 py-1 text-xs text-muted sm:block">
          {availabilityLabel}
        </span>
      </div>
    </aside>
  );
}
