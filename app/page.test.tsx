import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home', () => {
  it('renders the primary value proposition', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', {
        name: /trusted french & english bulldogs, raised with southern warmth/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/akC pedigrees, OFA screenings/i)).toBeVisible();
    const primaryCtas = screen.getAllByRole('link', { name: /view available puppies/i });
    expect(primaryCtas).toHaveLength(2);
    primaryCtas.forEach((cta) => expect(cta).toBeVisible());
  });
});
