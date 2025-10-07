const contacts = [
  { href: "tel:+12055551234", label: "Call" },
  { href: "sms:+12055551234", label: "Text" },
  { href: "https://wa.me/12055551234", label: "WhatsApp" },
  { href: "https://t.me/exoticbulldoglevel", label: "Telegram" },
  { href: "mailto:hello@exoticbulldoglevel.com", label: "Email" },
];

export function ContactBar() {
  return (
    <aside className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-3xl -translate-x-1/2 rounded-full border border-neutral-200 bg-white/95 p-2 shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {contacts.map((contact) => (
          <a
            key={contact.label}
            href={contact.href}
            className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:border-neutral-300 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            {contact.label}
          </a>
        ))}
        <span className="hidden text-xs text-neutral-500 sm:block">
          More channels coming in Sprint 2 (chat & analytics)
        </span>
      </div>
    </aside>
  );
}
