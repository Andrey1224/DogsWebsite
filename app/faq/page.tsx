// New dark FAQ page with search and accordion
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { buildMetadata } from '@/lib/seo/metadata';
import { getFaqSchema } from '@/lib/seo/structured-data';

import { FaqContent } from './faq-content';
import { faqItemsFlat } from './faq-data';

export const metadata = buildMetadata({
  title: 'Frequently Asked Questions | Exotic Bulldog Legacy',
  description:
    'Find answers about reserving, raising, and transporting French and English bulldog puppies from Exotic Bulldog Legacy.',
  path: '/faq',
});

export default function FaqPage() {
  const faqSchema = getFaqSchema(faqItemsFlat);

  return (
    <div className="min-h-screen bg-[#0B1120] pb-20 font-sans text-white">
      {/* SEO - Hidden Breadcrumbs */}
      <div className="sr-only">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'FAQ', href: '/faq' },
          ]}
        />
      </div>
      <JsonLd id="faq-schema" data={faqSchema} />

      <FaqContent />
    </div>
  );
}
