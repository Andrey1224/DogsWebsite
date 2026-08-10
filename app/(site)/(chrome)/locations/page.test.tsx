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
      screen.getByRole('heading', {
        name: /french & english bulldog puppies in alabama/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/honest drive-time estimates, local logistics, delivery options/i),
    ).toBeInTheDocument();
  });

  it('adds North Alabama context and planning links', () => {
    render(<LocationsPage />);

    expect(
      screen.getByRole('heading', {
        name: /based near falkville, serving north alabama/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/based near Falkville, about 20 minutes north of Cullman/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view available puppies/i })).toHaveAttribute(
      'href',
      '/puppies',
    );
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /read faq/i })).toHaveAttribute('href', '/faq');
    expect(screen.getByRole('link', { name: /deposit & health policies/i })).toHaveAttribute(
      'href',
      '/terms',
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

  it.each([
    ['Cullman', '/locations/cullman-al'],
    ['Decatur', '/locations/decatur-al'],
    ['Huntsville', '/locations/huntsville-al'],
    ['Birmingham', '/locations/birmingham-al'],
  ])('links to the %s service-area page', (city, href) => {
    render(<LocationsPage />);

    expect(
      screen.getByRole('link', { name: new RegExp(`View ${city} details`, 'i') }),
    ).toHaveAttribute('href', href);
  });
});
