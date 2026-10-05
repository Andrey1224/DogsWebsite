import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PuppiesPage, { metadata } from './page';
import type { PuppyWithRelations } from '@/lib/supabase/types';

// Mock Supabase queries — keep the real bucketPuppiesByStatus implementation,
// only stub the data fetch.
vi.mock('@/lib/supabase/queries', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/supabase/queries')>();
  return {
    ...actual,
    getFilteredPuppies: vi.fn(),
  };
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/puppies',
}));

const basePuppy: Omit<PuppyWithRelations, 'parents' | 'litter'> = {
  id: 'puppy-1',
  litter_id: null,
  name: 'Buddy',
  slug: 'buddy-french-bulldog',
  breed: 'french_bulldog',
  sex: 'male',
  color: 'Blue Merle',
  birth_date: '2024-01-01',
  price_usd: 3000,
  status: 'available',
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
  sire_color_notes: null,
  sire_health_notes: null,
  sire_temperament_notes: null,
  sire_weight_notes: null,
  dam_color_notes: null,
  dam_health_notes: null,
  dam_temperament_notes: null,
  dam_weight_notes: null,
};

function mockPuppy(overrides: Partial<PuppyWithRelations>): PuppyWithRelations {
  return {
    ...basePuppy,
    parents: null,
    litter: null,
    ...overrides,
  };
}

describe('Puppies Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the SEO title and meta description', () => {
    expect(metadata.title).toBe('Available French & English Bulldog Puppies in Alabama');
    expect(metadata.description).toBe(
      'Browse available French and English Bulldog puppies in Alabama. View current profiles, health details, pricing, and Falkville-area pickup or delivery options.',
    );
  });

  it('renders hero heading matching the SEO title', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Available French & English Bulldog Puppies in Alabama/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders the available-puppies opening copy when puppies are available', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([mockPuppy({ status: 'available' })]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(
      screen.getByText(/Open a profile for photos, pricing, temperament notes/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Available Now', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view available puppies/i })).toHaveAttribute(
      'href',
      '/puppies?status=available#available-now',
    );
  });

  it('renders an honest fallback opening copy and CTA when no puppies are available', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(screen.getByText(/No puppies are available to reserve today/i)).toBeInTheDocument();
    expect(screen.getByText('Current Availability')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ask about upcoming litters/i })).toHaveAttribute(
      'href',
      '/contact',
    );
  });

  it('renders contextual planning links', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(screen.getByRole('link', { name: /pickup & delivery areas/i })).toHaveAttribute(
      'href',
      '/locations',
    );
    expect(screen.getByRole('link', { name: /puppy faq/i })).toHaveAttribute('href', '/faq');
    // "Contact us" appears both in the inline link row and in the process block's step 2 —
    // both must point to /contact.
    const contactLinks = screen.getAllByRole('link', { name: /contact us/i });
    expect(contactLinks.length).toBeGreaterThanOrEqual(1);
    contactLinks.forEach((link) => expect(link).toHaveAttribute('href', '/contact'));
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

  it('renders compact service area links below the listings', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(
      screen.getByRole('heading', {
        name: /pickup & delivery options for alabama buyers/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /birmingham pickup details/i })).toHaveAttribute(
      'href',
      '/locations/birmingham-al',
    );
    expect(screen.getByRole('link', { name: /huntsville pickup details/i })).toHaveAttribute(
      'href',
      '/locations/huntsville-al',
    );
    expect(screen.getByRole('link', { name: /view all service areas/i })).toHaveAttribute(
      'href',
      '/locations',
    );
  });

  it('renders puppy cards when puppies are available', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([mockPuppy({ status: 'available' })]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(screen.getByText('Buddy')).toBeInTheDocument();
  });

  it('renders an "Available Now" heading above the available-puppy grid', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([mockPuppy({ status: 'available' })]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(screen.getByRole('heading', { level: 2, name: /^Available Now$/i })).toBeInTheDocument();
  });

  it('renders an "Upcoming Litters" section only when an upcoming puppy exists', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');

    vi.mocked(getFilteredPuppies).mockResolvedValue([
      mockPuppy({ id: 'upcoming-1', name: 'Luna', slug: 'luna', status: 'upcoming' }),
    ]);
    const withUpcoming = await PuppiesPage({ searchParams: Promise.resolve({}) });
    const { unmount } = render(withUpcoming);
    expect(
      screen.getByRole('heading', { level: 2, name: /Upcoming Litters/i }),
    ).toBeInTheDocument();
    unmount();

    vi.mocked(getFilteredPuppies).mockResolvedValue([mockPuppy({ status: 'available' })]);
    const withoutUpcoming = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(withoutUpcoming);
    expect(screen.queryByText(/Upcoming Litters/i)).not.toBeInTheDocument();
  });

  it('renders a "Past Puppies" section only when a reserved or sold puppy exists', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');

    vi.mocked(getFilteredPuppies).mockResolvedValue([
      mockPuppy({ id: 'sold-1', name: 'Max', slug: 'max', status: 'sold' }),
    ]);
    const withPast = await PuppiesPage({ searchParams: Promise.resolve({}) });
    const { unmount } = render(withPast);
    expect(screen.getByRole('heading', { level: 2, name: /Past Puppies/i })).toBeInTheDocument();
    unmount();

    vi.mocked(getFilteredPuppies).mockResolvedValue([mockPuppy({ status: 'available' })]);
    const withoutPast = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(withoutPast);
    expect(screen.queryByText(/Past Puppies/i)).not.toBeInTheDocument();
  });

  it('lists the Available Now section before the Past Puppies section', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([
      mockPuppy({ id: 'available-1', name: 'Buddy', slug: 'buddy', status: 'available' }),
      mockPuppy({ id: 'sold-1', name: 'Max', slug: 'max', status: 'sold' }),
    ]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);
    const availableIndex = headings.findIndex((text) => text === 'Available Now');
    const pastIndex = headings.findIndex((text) => text === 'Past Puppies');

    expect(availableIndex).toBeGreaterThanOrEqual(0);
    expect(pastIndex).toBeGreaterThan(availableIndex);
  });

  it('renders the Available Now section as the very first heading on the page', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([
      mockPuppy({ id: 'available-1', name: 'Buddy', slug: 'buddy', status: 'available' }),
      mockPuppy({ id: 'upcoming-1', name: 'Luna', slug: 'luna', status: 'upcoming' }),
      mockPuppy({ id: 'sold-1', name: 'Max', slug: 'max', status: 'sold' }),
    ]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[0]).toHaveTextContent('Available Now');
  });

  it('places the puppy gallery before "How the Process Works"', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([mockPuppy({ status: 'available' })]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);
    const galleryIndex = headings.findIndex((text) => text === 'Available Now');
    const processIndex = headings.findIndex((text) => text === 'How the Process Works');

    expect(galleryIndex).toBeGreaterThanOrEqual(0);
    expect(processIndex).toBeGreaterThan(galleryIndex);
  });

  it('places the puppy gallery before the Puppy FAQ', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([mockPuppy({ status: 'available' })]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);
    const galleryIndex = headings.findIndex((text) => text === 'Available Now');
    const faqIndex = headings.findIndex((text) => text === 'Puppy FAQ');

    expect(galleryIndex).toBeGreaterThanOrEqual(0);
    expect(faqIndex).toBeGreaterThan(galleryIndex);
  });

  it('shows Past Puppies immediately after the filters/empty-notice when nothing is available or upcoming', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([
      mockPuppy({ id: 'sold-1', name: 'Max', slug: 'max', status: 'sold' }),
    ]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(screen.getByText('No puppies are currently available or upcoming.')).toBeInTheDocument();

    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent);
    const pastIndex = headings.findIndex((text) => text === 'Past Puppies');
    const processIndex = headings.findIndex((text) => text === 'How the Process Works');

    expect(pastIndex).toBe(0);
    expect(processIndex).toBeGreaterThan(pastIndex);
  });

  it('does not show Past Puppies when an explicit status=available filter has zero results', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockImplementation(async (filter) => {
      const isGlobalCall = !filter || Object.keys(filter).length === 0;
      return isGlobalCall
        ? [mockPuppy({ id: 'sold-1', name: 'Max', slug: 'max', status: 'sold' })]
        : [];
    });

    const component = await PuppiesPage({ searchParams: Promise.resolve({ status: 'available' }) });
    render(component);

    expect(
      screen.getByText(/No puppies match the selected filters right now/i),
    ).toBeInTheDocument();
    expect(screen.queryByText('Past Puppies')).not.toBeInTheDocument();
  });

  it('keeps the hero reflecting global availability regardless of applied filters', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockImplementation(async (filter) => {
      const isGlobalCall = !filter || Object.keys(filter).length === 0;
      return isGlobalCall ? [mockPuppy({ status: 'available' })] : [];
    });

    const component = await PuppiesPage({
      searchParams: Promise.resolve({ breed: 'english_bulldog' }),
    });
    render(component);

    // The grid itself finds nothing for this filter...
    expect(
      screen.getByText(/No puppies match the selected filters right now/i),
    ).toBeInTheDocument();
    // ...but the hero still truthfully reflects that puppies are available elsewhere, and its
    // CTA clears the incompatible filter instead of linking to an anchor the current filter
    // has emptied out.
    expect(screen.getByText('Available Now', { selector: 'div' })).toBeInTheDocument();
    expect(
      screen.getByText(/Open a profile for photos, pricing, temperament notes/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view available puppies/i })).toHaveAttribute(
      'href',
      '/puppies?status=available#available-now',
    );
  });

  it('renders the "How the Process Works" block with the four verified steps', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(
      screen.getByRole('heading', { level: 2, name: /How the Process Works/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Review the current puppy profile and available records/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/to ask questions and schedule a video call or visit/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /After buyer approval and a signed contract, the deposit reserves the puppy/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Coordinate Falkville-area pickup or an approved delivery option/i),
    ).toBeInTheDocument();
  });

  it('renders the page-specific Puppy FAQ with all four questions', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    render(component);

    expect(screen.getByRole('heading', { level: 2, name: /Puppy FAQ/i })).toBeInTheDocument();
    expect(screen.getByText('How can I check current puppy availability?')).toBeInTheDocument();
    expect(
      screen.getByText('What health and veterinary records come with a puppy?'),
    ).toBeInTheDocument();
    expect(screen.getByText('When is the deposit paid?')).toBeInTheDocument();
    expect(screen.getByText('What pickup or delivery options are available?')).toBeInTheDocument();
  });

  it('renders FAQPage structured data matching the visible FAQ text', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await PuppiesPage({ searchParams: Promise.resolve({}) });
    const { container } = render(component);

    const script = container.querySelector('script#puppies-faq-schema');
    expect(script).toBeTruthy();

    const schema = JSON.parse(script?.textContent || '{}');
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(4);
    expect(schema.mainEntity[0].name).toBe('How can I check current puppy availability?');
    expect(schema.mainEntity[2].name).toBe('When is the deposit paid?');
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
