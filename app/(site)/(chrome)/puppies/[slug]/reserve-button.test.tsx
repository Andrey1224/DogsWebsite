import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ReserveButton } from './reserve-button';

vi.mock('./actions', () => ({
  createCheckoutSession: vi.fn(),
}));

describe('ReserveButton', () => {
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
});
