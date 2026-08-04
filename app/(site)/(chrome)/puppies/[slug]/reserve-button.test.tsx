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
        puppyPrice={4500}
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
        puppyPrice={null}
        paypalClientId={null}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Reserve Sunny' }));

    expect(createCheckoutSession).toHaveBeenCalledWith('sunny', 'deposit', {
      clientId: '123.456',
      sessionId: '789',
    });
    expect(trackEventMock).toHaveBeenCalledWith('reserve_click', {
      puppy_slug: 'sunny',
      puppy_name: 'Sunny',
      deposit_amount: 300,
      payment_provider: 'stripe',
      payment_type: 'deposit',
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

  it('renders only the deposit button when puppyPrice is null', () => {
    render(
      <ReserveButton
        puppySlug="sunny"
        puppyName="Sunny"
        status="available"
        canReserve
        reservationBlocked={false}
        reservationsDisabled={false}
        depositAmount={300}
        puppyPrice={null}
        paypalClientId={null}
      />,
    );

    expect(screen.getByRole('button', { name: 'Reserve Sunny' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /buy now/i })).not.toBeInTheDocument();
  });

  it('renders both the deposit and full-payment buttons when puppyPrice is set', () => {
    render(
      <ReserveButton
        puppySlug="sunny"
        puppyName="Sunny"
        status="available"
        canReserve
        reservationBlocked={false}
        reservationsDisabled={false}
        depositAmount={300}
        puppyPrice={4500}
        paypalClientId={null}
      />,
    );

    expect(screen.getByRole('button', { name: 'Reserve Sunny' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buy now.*4,500/i })).toBeInTheDocument();
  });

  it('tracks the full-payment checkout funnel', async () => {
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
        puppyPrice={4500}
        paypalClientId={null}
      />,
    );

    const fullPaymentButton = screen.getByRole('button', { name: /buy now.*4,500/i });

    await user.click(fullPaymentButton);

    expect(createCheckoutSession).toHaveBeenCalledWith('sunny', 'full', {
      clientId: '123.456',
      sessionId: '789',
    });
    expect(trackEventMock).toHaveBeenCalledWith('reserve_click', {
      puppy_slug: 'sunny',
      puppy_name: 'Sunny',
      deposit_amount: 4500,
      payment_provider: 'stripe',
      payment_type: 'full',
    });
    expect(trackEventMock).toHaveBeenCalledWith('begin_checkout', {
      currency: 'USD',
      value: 4500,
      items: [
        {
          item_id: 'sunny',
          item_name: 'Sunny',
          item_category: 'Puppy full payment',
          price: 4500,
          quantity: 1,
        },
      ],
    });
  });

  it('disables both buttons while a checkout request is in flight', async () => {
    const user = userEvent.setup();
    let resolveCheckout: (value: Awaited<ReturnType<typeof createCheckoutSession>>) => void;
    vi.mocked(createCheckoutSession).mockReturnValue(
      new Promise((resolve) => {
        resolveCheckout = resolve;
      }),
    );

    render(
      <ReserveButton
        puppySlug="sunny"
        puppyName="Sunny"
        status="available"
        canReserve
        reservationBlocked={false}
        reservationsDisabled={false}
        depositAmount={300}
        puppyPrice={4500}
        paypalClientId={null}
      />,
    );

    const fullPaymentButton = screen.getByRole('button', { name: /buy now.*4,500/i });
    const depositButton = screen.getByRole('button', { name: 'Reserve Sunny' });

    await user.click(fullPaymentButton);

    expect(depositButton).toBeDisabled();
    expect(fullPaymentButton).toBeDisabled();

    resolveCheckout!({
      success: false,
      error: 'stop before redirect',
      errorCode: 'STRIPE_ERROR',
    });
  });
});
