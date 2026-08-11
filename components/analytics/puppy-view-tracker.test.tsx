import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PuppyViewTracker } from './puppy-view-tracker';

const trackEventMock = vi.hoisted(() => vi.fn());
const analyticsMock = vi.hoisted(() => ({
  consent: 'granted' as const,
  metaReady: true,
  trackEvent: trackEventMock,
}));

vi.mock('@/components/analytics-provider', () => ({
  useAnalytics: () => analyticsMock,
}));

describe('PuppyViewTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analyticsMock.consent = 'granted';
    analyticsMock.metaReady = true;
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

  it('does not track while the Meta pixel is not ready yet (direct ad-landing load)', async () => {
    analyticsMock.metaReady = false;

    render(
      <PuppyViewTracker
        slug="sunny"
        name="Sunny"
        breed="French Bulldog"
        price={3000}
        status="available"
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(trackEventMock).not.toHaveBeenCalled();
  });

  it('tracks exactly once once the pixel becomes ready, and once more on an SPA transition to a new puppy', async () => {
    analyticsMock.metaReady = false;

    const { rerender } = render(
      <PuppyViewTracker
        slug="sunny"
        name="Sunny"
        breed="French Bulldog"
        price={3000}
        status="available"
      />,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(trackEventMock).not.toHaveBeenCalled();

    analyticsMock.metaReady = true;
    rerender(
      <PuppyViewTracker
        slug="sunny"
        name="Sunny"
        breed="French Bulldog"
        price={3000}
        status="available"
      />,
    );

    await waitFor(() => {
      expect(trackEventMock).toHaveBeenCalledTimes(1);
    });
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

    rerender(
      <PuppyViewTracker
        slug="dory"
        name="Dory"
        breed="French Bulldog"
        price={3500}
        status="available"
      />,
    );

    await waitFor(() => {
      expect(trackEventMock).toHaveBeenCalledTimes(2);
    });
    expect(trackEventMock).toHaveBeenLastCalledWith('view_item', {
      currency: 'USD',
      value: 3500,
      puppy_status: 'available',
      items: [
        {
          item_id: 'dory',
          item_name: 'Dory',
          item_category: 'French Bulldog',
          price: 3500,
          quantity: 1,
        },
      ],
    });
  });
});
