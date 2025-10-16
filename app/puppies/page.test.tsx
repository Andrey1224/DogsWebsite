import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PuppiesPage from './page';

// Mock Supabase queries
vi.mock('@/lib/supabase/queries', () => ({
  getFilteredPuppies: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/puppies',
}));

describe('Puppies Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero heading and description', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(
      screen.getByRole('heading', {
        name: /French & English bulldogs available and upcoming/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Browse our current litters, review temperament notes/i)
    ).toBeInTheDocument();
  });

  it('renders breadcrumbs navigation', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getAllByText('Puppies').length).toBeGreaterThan(0);
  });

  it('displays empty state when no puppies match filters', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(
      screen.getByText(/No puppies match the selected filters right now/i)
    ).toBeInTheDocument();
  });

  it('renders puppy cards when puppies are available', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    const mockPuppies = [
      {
        id: 'puppy-1',
        litter_id: null,
        name: 'Buddy',
        slug: 'buddy-french-bulldog',
        sex: 'male' as const,
        color: 'Blue Merle',
        birth_date: '2024-01-01',
        price_usd: 3000,
        status: 'available' as const,
        weight_oz: 32,
        description: 'A lovely puppy',
        photo_urls: ['/test-image.jpg'],
        video_urls: null,
        paypal_enabled: true,
        stripe_payment_link: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        litter: null,
        parents: null,
      },
    ];
    vi.mocked(getFilteredPuppies).mockResolvedValue(mockPuppies);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(screen.getByText('Buddy')).toBeInTheDocument();
  });

  it('applies status filter from search params', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({
      searchParams: Promise.resolve({ status: 'available' }),
    });
    render(component);

    expect(getFilteredPuppies).toHaveBeenCalledWith({
      status: 'available',
      breed: 'all',
    });
  });

  it('applies breed filter from search params', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({
      searchParams: Promise.resolve({ breed: 'french_bulldog' }),
    });
    render(component);

    expect(getFilteredPuppies).toHaveBeenCalledWith({
      status: 'all',
      breed: 'french_bulldog',
    });
  });

  it('ignores invalid filter values', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({
      searchParams: Promise.resolve({ status: 'invalid', breed: 'invalid' }),
    });
    render(component);

    expect(getFilteredPuppies).toHaveBeenCalledWith({
      status: 'all',
      breed: 'all',
    });
  });
});
