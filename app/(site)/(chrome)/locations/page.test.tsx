import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AnchorHTMLAttributes } from 'react';

import LocationsPage from './page';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    prefetch,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => {
    void prefetch;
    return <a {...props}>{children}</a>;
  },
}));

describe('Locations Page', () => {
  it('uses the updated intro copy for city pages', () => {
    render(<LocationsPage />);

    expect(
      screen.getByText(/local logistics, delivery options, and city-specific FAQs\./i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/local logistics, testimonials, and city-specific FAQs\./i),
    ).not.toBeInTheDocument();
  });

  it('adds North Alabama context and planning links', () => {
    render(<LocationsPage />);

    expect(
      screen.getByRole('heading', {
        name: /based near falkville, serving north alabama/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Exotic Bulldog Legacy is based near Falkville, just outside Cullman/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view available puppies/i })).toHaveAttribute(
      'href',
      '/puppies',
    );
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /read faq/i })).toHaveAttribute('href', '/faq');
    expect(screen.getByRole('link', { name: /deposit & health policies/i })).toHaveAttribute(
      'href',
      '/policies',
    );
  });

  it('explains pickup and delivery after the city cards', () => {
    render(<LocationsPage />);

    expect(
      screen.getByRole('heading', { name: /how pickup and delivery works/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Pickup is arranged by appointment near Falkville, Alabama/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ground transportation, airport coordination, or flight nanny delivery/i),
    ).toBeInTheDocument();
  });
});
