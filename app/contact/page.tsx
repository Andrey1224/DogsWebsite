import { ContactForm } from "@/components/contact-form";
import { ContactCards } from "@/components/contact-cards";
import { CONTACT_CARDS } from "@/lib/config/contact";

export const metadata = {
  title: "Contact Exotic Bulldog Level",
  description:
    "Reach Exotic Bulldog Level via call, text, WhatsApp, or the inquiry form to discuss French and English bulldog puppies.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-12">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">Contact</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Let’s plan your bulldog match
        </h1>
        <p className="text-sm text-muted">
          Send an inquiry or tap the quick actions in the contact bar. Share a bit about your family,
          desired timing, and any must-have traits so we can recommend the right puppy.
        </p>
      </header>

      <ContactCards cards={CONTACT_CARDS} />

      <ContactForm
        heading={{
          eyebrow: "Inquiry",
          title: "Send an introduction",
          description:
            "Let us know the puppy you’re eyeing, your preferred timeline, and how you’d like us to connect.",
        }}
      />
    </div>
  );
}
