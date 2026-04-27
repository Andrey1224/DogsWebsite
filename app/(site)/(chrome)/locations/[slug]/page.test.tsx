import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnchorHTMLAttributes } from 'react';

import LocationPage from './page';

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

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('notFound');
  }),
}));

vi.mock('@/lib/supabase/queries', () => ({
  getFilteredPuppies: vi.fn(),
}));

describe('Location Page', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);
  });

  it.each([
    ['birmingham-al', 'Birmingham'],
    ['huntsville-al', 'Huntsville'],
  ])('does not render the testimonial section for %s', async (slug, city) => {
    const component = await LocationPage({ params: Promise.resolve({ slug }) });
    render(component);

    expect(
      screen.queryByRole('heading', { name: new RegExp(`What ${city} Buyers Say`, 'i') }),
    ).not.toBeInTheDocument();
  });

  it('shows the normalized Birmingham deposit amount in the FAQ', async () => {
    const component = await LocationPage({ params: Promise.resolve({ slug: 'birmingham-al' }) });
    render(component);

    expect(
      screen.getByText(/\$300 non-refundable deposit secures your pick from the litter/i),
    ).toBeInTheDocument();
  });
});
