import React from 'react';
import { render, screen } from '@testing-library/react';
import Home, { metadata } from './page';

describe('Home', () => {
  it('exports homepage metadata with Falkville pickup wording', () => {
    expect(metadata.description).toContain('appointment pickup in Falkville');
    expect(metadata.description).not.toContain('Montgomery pickup');
    expect(metadata.openGraph?.description).toContain('appointment pickup in Falkville');
    expect(metadata.twitter?.description).toContain('appointment pickup in Falkville');
  });

  it('renders the primary value proposition', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', {
        name: /french & english bulldog puppies available in falkville, alabama/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/akC pedigrees, OFA screenings/i)).toBeVisible();
    const primaryCtas = screen.getAllByRole('link', { name: /view available puppies/i });
    expect(primaryCtas).toHaveLength(3);
    primaryCtas.forEach((cta) => expect(cta).toBeVisible());
  });

  it('renders compact service area links', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: /pickup & delivery for alabama families/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: /service areas learn how pickup and delivery work for alabama families/i,
      }),
    ).toHaveAttribute('href', '/locations');
    expect(
      screen.getByRole('link', {
        name: /birmingham families pickup and delivery details for birmingham/i,
      }),
    ).toHaveAttribute('href', '/locations/birmingham-al');
    expect(
      screen.getByRole('link', {
        name: /huntsville families pickup and flight nanny details for huntsville/i,
      }),
    ).toHaveAttribute('href', '/locations/huntsville-al');
  });
});
