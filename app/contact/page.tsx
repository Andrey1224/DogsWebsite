import { ContactForm } from '@/components/contact-form';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ContactCards } from '@/components/contact-cards';
import { CONTACT_CARDS } from '@/lib/config/contact';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Contact Exotic Bulldog Legacy',
  description:
    'Call, text, or message Exotic Bulldog Legacy to plan your French or English bulldog adoption, book kennel visits, or ask health questions.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-12">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">Contact</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Let&apos;s plan your bulldog match
        </h1>
        <p className="text-sm text-muted">
          Send an inquiry or tap the quick actions in the contact bar. Share a bit about your
          family, desired timing, and any must-have traits so we can recommend the right puppy.
        </p>
      </div>

      <ContactCards cards={CONTACT_CARDS} />

      <ContactForm
        heading={{
          eyebrow: 'Inquiry',
          title: 'Send an introduction',
          description:
            'Let us know the puppy you’re eyeing, your preferred timeline, and how you’d like us to connect.',
        }}
      />
    </div>
  );
}
