import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PuppyViewTracker } from './puppy-view-tracker';

const trackEventMock = vi.hoisted(() => vi.fn());

vi.mock('@/components/analytics-provider', () => ({
  useAnalytics: () => ({
    consent: 'granted',
    trackEvent: trackEventMock,
  }),
}));

describe('PuppyViewTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tracks one GA4 view_item event for a puppy detail view', async () => {
    const { rerender } = render(
      <PuppyViewTracker
        slug="sunny"
        name="Sunny"
        breed="French Bulldog"
        price={3000}
        status="available"
      />,
    );

    await waitFor(() => {
      expect(trackEventMock).toHaveBeenCalledWith('view_item', {
        currency: 'USD',
        value: 3000,
        puppy_status: 'available',
        items: [
          {
            item_id: 'sunny',
            item_name: 'Sunny',
            item_category: 'French Bulldog',
            price: 3000,
            quantity: 1,
          },
        ],
      });
    });

    rerender(
      <PuppyViewTracker
        slug="sunny"
        name="Sunny"
        breed="French Bulldog"
        price={3000}
        status="available"
      />,
    );

    expect(trackEventMock).toHaveBeenCalledTimes(1);
  });
});
