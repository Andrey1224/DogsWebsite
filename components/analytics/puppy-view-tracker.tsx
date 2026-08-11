'use client';

import { useEffect, useRef } from 'react';

import { useAnalytics } from '@/components/analytics-provider';

type PuppyViewTrackerProps = {
  slug: string;
  name: string;
  breed: string;
  price: number | null;
  status: string;
};

export function PuppyViewTracker({ slug, name, breed, price, status }: PuppyViewTrackerProps) {
  const { consent, metaReady, trackEvent } = useAnalytics();
  const trackedSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (consent !== 'granted' || !metaReady || trackedSlugRef.current === slug) return;

    trackEvent('view_item', {
      currency: 'USD',
      value: price ?? undefined,
      puppy_status: status,
      items: [
        {
          item_id: slug,
          item_name: name,
          item_category: breed,
          price: price ?? undefined,
          quantity: 1,
        },
      ],
    });
    trackedSlugRef.current = slug;
  }, [breed, consent, metaReady, name, price, slug, status, trackEvent]);

  return null;
}
