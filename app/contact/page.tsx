import { ContactFormShell } from "@/components/contact-form";

export const metadata = {
  title: "Contact Exotic Bulldog Level",
  description:
    "Reach Exotic Bulldog Level via call, text, WhatsApp, or the inquiry form to discuss French and English bulldog puppies.",
};

const channels = [
  {
    label: "Call or text",
    value: "+1 (205) 555-1234",
    href: "tel:+12055551234",
    description: "Available 9am–7pm CT. Leave a voicemail after hours and we’ll return it within a business day.",
  },
  {
    label: "WhatsApp",
    value: "+1 (205) 555-1234",
    href: "https://wa.me/12055551234",
    description: "Instant messaging with photos/videos of current puppies and facility tours.",
  },
  {
    label: "Email",
    value: "hello@exoticbulldoglevel.com",
    href: "mailto:hello@exoticbulldoglevel.com",
    description: "Detailed questions, vet references, and contract requests.",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-12">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600">Contact</p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Let’s plan your bulldog match
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          Send an inquiry or tap the quick actions in the contact bar. Share a bit about your family,
          desired timing, and any must-have traits so we can recommend the right puppy.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2">
        {channels.map((channel) => (
          <article
            key={channel.label}
            className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900/80"
          >
            <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">{channel.label}</p>
            <a
              href={channel.href}
              className="mt-2 block text-lg font-semibold text-emerald-600 hover:underline"
            >
              {channel.value}
            </a>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">{channel.description}</p>
          </article>
        ))}
      </section>

      <ContactFormShell />
    </div>
  );
}
