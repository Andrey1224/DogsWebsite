import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReserveButton } from './reserve-button';
import { createCheckoutSession } from './actions';

const trackEventMock = vi.hoisted(() => vi.fn());
const getAnalyticsIdentifiersMock = vi.hoisted(() =>
  vi.fn(async () => ({ clientId: '123.456', sessionId: '789' })),
);

vi.mock('@/components/analytics-provider', () => ({
  useAnalytics: () => ({
    getAnalyticsIdentifiers: getAnalyticsIdentifiersMock,
    trackEvent: trackEventMock,
  }),
}));

vi.mock('./actions', () => ({
  createCheckoutSession: vi.fn(),
}));

describe('ReserveButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows sold puppies as unavailable even when reservations are globally paused', () => {
    render(
      <ReserveButton
        puppySlug="mocha"
        puppyName="Mocha"
        status="sold"
        canReserve={false}
        reservationBlocked={false}
        reservationsDisabled
        depositAmount={300}
        paypalClientId={null}
      />,
    );

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/has found a home/i)).toBeInTheDocument();
    expect(screen.queryByText(/reservations temporarily paused/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reserve/i })).not.toBeInTheDocument();
  });

  it('tracks the checkout funnel before opening Stripe', async () => {
    const user = userEvent.setup();
    vi.mocked(createCheckoutSession).mockResolvedValue({
      success: false,
      error: 'Test stop before redirect',
      errorCode: 'STRIPE_ERROR',
    });

    render(
      <ReserveButton
        puppySlug="sunny"
        puppyName="Sunny"
        status="available"
        canReserve
        reservationBlocked={false}
        reservationsDisabled={false}
        depositAmount={300}
        paypalClientId={null}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Reserve Sunny' }));

    expect(createCheckoutSession).toHaveBeenCalledWith('sunny', {
      clientId: '123.456',
      sessionId: '789',
    });
    expect(trackEventMock).toHaveBeenCalledWith('reserve_click', {
      puppy_slug: 'sunny',
      puppy_name: 'Sunny',
      deposit_amount: 300,
      payment_provider: 'stripe',
    });
    expect(trackEventMock).toHaveBeenCalledWith('begin_checkout', {
      currency: 'USD',
      value: 300,
      items: [
        {
          item_id: 'sunny',
          item_name: 'Sunny',
          item_category: 'Puppy deposit',
          price: 300,
          quantity: 1,
        },
      ],
    });
  });
});
