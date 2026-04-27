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
});
