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

  it('renders hero heading with gradient text', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /French & English bulldogs available now/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders hero description', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(
      screen.getByText(/Browse our current litters, review temperament notes/i),
    ).toBeInTheDocument();
  });

  it('renders breadcrumbs navigation (SEO only)', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('displays empty state when no puppies match filters', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(
      screen.getByText(/No puppies match the selected filters right now/i),
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
        breed: 'french_bulldog' as const,
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
        is_archived: false,
        sold_at: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        sire_id: null,
        dam_id: null,
        sire_name: null,
        dam_name: null,
        sire_photo_urls: null,
        dam_photo_urls: null,
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
      sex: 'all',
      priceMin: undefined,
      priceMax: undefined,
      search: undefined,
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
      sex: 'all',
      priceMin: undefined,
      priceMax: undefined,
      search: undefined,
    });
  });

  it('applies sex filter from search params', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({
      searchParams: Promise.resolve({ sex: 'female' }),
    });
    render(component);

    expect(getFilteredPuppies).toHaveBeenCalledWith({
      status: 'all',
      breed: 'all',
      sex: 'female',
      priceMin: undefined,
      priceMax: undefined,
      search: undefined,
    });
  });

  it('applies price range filter from search params', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({
      searchParams: Promise.resolve({ price: '4000-5000' }),
    });
    render(component);

    expect(getFilteredPuppies).toHaveBeenCalledWith({
      status: 'all',
      breed: 'all',
      sex: 'all',
      priceMin: 4000,
      priceMax: 5000,
      search: undefined,
    });
  });

  it('applies search filter from search params', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({
      searchParams: Promise.resolve({ search: 'Buddy' }),
    });
    render(component);

    expect(getFilteredPuppies).toHaveBeenCalledWith({
      status: 'all',
      breed: 'all',
      sex: 'all',
      priceMin: undefined,
      priceMax: undefined,
      search: 'Buddy',
    });
  });

  it('applies multiple filters from search params', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({
      searchParams: Promise.resolve({
        status: 'available',
        breed: 'french_bulldog',
        sex: 'male',
        price: '0-4000',
        search: 'Luna',
      }),
    });
    render(component);

    expect(getFilteredPuppies).toHaveBeenCalledWith({
      status: 'available',
      breed: 'french_bulldog',
      sex: 'male',
      priceMin: 0,
      priceMax: 4000,
      search: 'Luna',
    });
  });

  it('ignores invalid filter values', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({
      searchParams: Promise.resolve({ status: 'invalid', breed: 'invalid', sex: 'invalid' }),
    });
    render(component);

    expect(getFilteredPuppies).toHaveBeenCalledWith({
      status: 'all',
      breed: 'all',
      sex: 'all',
      priceMin: undefined,
      priceMax: undefined,
      search: undefined,
    });
  });
});
