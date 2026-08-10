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

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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
    expect(screen.queryByText(/deposit payments temporarily paused/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /apply for/i })).not.toBeInTheDocument();
  });

  it('always shows the Apply and Schedule a Video Call CTAs pointing at the prefilled contact form', () => {
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

    const applyLink = screen.getByRole('link', { name: 'Apply for Sunny' });
    const scheduleLink = screen.getByRole('link', { name: 'Schedule a Video Call' });

    expect(applyLink).toHaveAttribute('href', '/contact?puppy=sunny');
    expect(scheduleLink).toHaveAttribute('href', '/contact?puppy=sunny');
  });

  it('does not render a "Buy Now" / pay-in-full button', () => {
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

    expect(screen.queryByRole('button', { name: /buy now/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/pay now/i)).not.toBeInTheDocument();
  });

  it('shows the deposit as a secondary, clearly labeled final step', () => {
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

    expect(
      screen.getByText(/Already approved\? A \$300 deposit secures Sunny/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pay $300 deposit' })).toBeInTheDocument();
    expect(screen.getByText(/Final step after approval/i)).toBeInTheDocument();
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

    await user.click(screen.getByRole('button', { name: 'Pay $300 deposit' }));

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

  it('disables the deposit button while a checkout request is in flight', async () => {
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
        paypalClientId={null}
      />,
    );

    const depositButton = screen.getByRole('button', { name: 'Pay $300 deposit' });

    await user.click(depositButton);

    expect(depositButton).toBeDisabled();

    resolveCheckout!({
      success: false,
      error: 'stop before redirect',
      errorCode: 'STRIPE_ERROR',
    });
  });

  it('still shows Apply/Schedule CTAs when deposit payments are globally paused', () => {
    render(
      <ReserveButton
        puppySlug="sunny"
        puppyName="Sunny"
        status="available"
        canReserve={false}
        reservationBlocked={false}
        reservationsDisabled
        reservationsDisabledMessage="We're finalizing Stripe customer setup."
        depositAmount={300}
        paypalClientId={null}
      />,
    );

    expect(screen.getByRole('link', { name: 'Apply for Sunny' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Schedule a Video Call' })).toBeInTheDocument();
    expect(screen.getByText(/Deposit payments temporarily paused/i)).toBeInTheDocument();
    expect(screen.getByText(/We're finalizing Stripe customer setup\./i)).toBeInTheDocument();
  });

  it('still shows Apply/Schedule CTAs when another reservation is in progress', () => {
    render(
      <ReserveButton
        puppySlug="sunny"
        puppyName="Sunny"
        status="available"
        canReserve={false}
        reservationBlocked
        reservationsDisabled={false}
        depositAmount={300}
        paypalClientId={null}
      />,
    );

    expect(screen.getByRole('link', { name: 'Apply for Sunny' })).toBeInTheDocument();
    expect(screen.getByText(/Reservation in progress/i)).toBeInTheDocument();
  });
});
