import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnchorHTMLAttributes } from 'react';

import LocationPage, { generateMetadata, generateStaticParams } from './page';
import type { PuppyWithRelations } from '@/lib/supabase/types';

const basePuppy: Omit<PuppyWithRelations, 'parents' | 'litter'> = {
  id: 'puppy-1',
  litter_id: null,
  name: 'Nippet',
  slug: 'nippet',
  breed: 'french_bulldog',
  sex: 'female',
  color: 'Fawn',
  birth_date: '2026-01-01',
  price_usd: 3500,
  status: 'available',
  weight_oz: 28,
  description: 'A lovely puppy',
  photo_urls: ['/test-image.jpg'],
  video_urls: null,
  paypal_enabled: true,
  stripe_payment_link: null,
  is_archived: false,
  sold_at: null,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
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
    ['cullman-al', 'Cullman'],
    ['decatur-al', 'Decatur'],
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
      screen.getByText(
        'A $300 non-refundable deposit reserves an approved available puppy and is applied to the final purchase price. Review the current deposit terms and complete the buyer-approval process before submitting payment.',
      ),
    ).toBeInTheDocument();
  });

  it('renders an honest Birmingham family note instead of fake testimonials', async () => {
    const component = await LocationPage({ params: Promise.resolve({ slug: 'birmingham-al' }) });
    render(component);

    expect(
      screen.getByRole('heading', { name: /^Before You Choose a Puppy$/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see available bulldog puppies/i })).toHaveAttribute(
      'href',
      '/puppies',
    );
    expect(
      screen.getByRole('link', { name: /learn how to review bulldog health tests/i }),
    ).toHaveAttribute('href', '/blog/choose-healthy-bulldog-puppy-health-tests');
    expect(screen.getByRole('link', { name: /read puppy-family reviews/i })).toHaveAttribute(
      'href',
      '/reviews',
    );
    expect(
      screen.getByRole('link', { name: /contact us about birmingham pickup or delivery/i }),
    ).toHaveAttribute('href', '/contact');
    expect(
      screen.getByRole('link', { name: /review deposit and delivery terms/i }),
    ).toHaveAttribute('href', '/terms');
    expect(screen.queryByText(/Melissa T\./i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DeShawn R\./i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Carla W\./i)).not.toBeInTheDocument();
  });

  it.each([
    ['birmingham-al', 'Birmingham'],
    ['huntsville-al', 'Huntsville'],
    ['cullman-al', 'Cullman'],
    ['decatur-al', 'Decatur'],
  ])('uses city-specific no-availability wording for %s', async (slug, city) => {
    const component = await LocationPage({ params: Promise.resolve({ slug }) });
    const { container } = render(component);

    expect(container).toHaveTextContent(
      `We do not have puppies available for ${city} families at this moment.`,
    );
    expect(container).toHaveTextContent(
      `future availability, reservation timing, and pickup or delivery options near ${city}.`,
    );
    expect(screen.queryByText(/No puppies are available right now/i)).not.toBeInTheDocument();
  });

  it.each(['birmingham-al', 'huntsville-al', 'cullman-al', 'decatur-al'])(
    'links %s families to the new owner resources',
    async (slug) => {
      const component = await LocationPage({ params: Promise.resolve({ slug }) });
      render(component);

      expect(screen.getByRole('link', { name: /new bulldog owner guide/i })).toHaveAttribute(
        'href',
        '/blog/ultimate-guide-for-new-bulldog-owners',
      );
      expect(screen.getByRole('link', { name: /puppy potty training/i })).toHaveAttribute(
        'href',
        '/blog/puppy-potty-training-101',
      );
      expect(
        screen
          .getAllByRole('link', { name: /health & deposit policies/i })
          .some((link) => link.getAttribute('href') === '/terms'),
      ).toBe(true);
    },
  );

  it.each([
    ['cullman-al', 'Cullman', /Cullman County is centrally positioned along Interstate 65/i],
    ['decatur-al', 'Decatur', /Decatur sits on the Tennessee River in North Alabama/i],
  ])('renders unique local planning content for %s', async (slug, city, localCopy) => {
    const component = await LocationPage({ params: Promise.resolve({ slug }) });
    render(component);

    expect(
      screen.getByRole('heading', { name: new RegExp(`Planning Your ${city} Puppy Pickup`, 'i') }),
    ).toBeInTheDocument();
    expect(screen.getByText(localCopy)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /check current puppies/i })).toHaveAttribute(
      'href',
      '/puppies',
    );

    const faqSchema = document.querySelector(`#location-faq-${slug}`);
    expect(JSON.parse(faqSchema?.textContent ?? '{}')).toMatchObject({
      '@type': 'FAQPage',
    });
  });

  it('pre-renders every indexable city page', () => {
    expect(generateStaticParams()).toEqual(
      expect.arrayContaining([
        { slug: 'birmingham-al' },
        { slug: 'huntsville-al' },
        { slug: 'cullman-al' },
        { slug: 'decatur-al' },
      ]),
    );
  });

  it.each([
    ['cullman-al', 'Bulldog Puppies Near Cullman, Alabama'],
    ['decatur-al', 'Bulldog Puppies Near Decatur, Alabama'],
  ])('uses search-focused metadata for %s', async (slug, title) => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });

    expect(metadata.title).toBe(title);
    expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe(`/locations/${slug}`);
  });
});

describe('Huntsville location page (Batch 2A)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('uses the expected title, meta description, self-canonical, and indexable robots', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'huntsville-al' }) });

    expect(metadata.title).toBe('French & English Bulldog Puppies Near Huntsville, AL');
    expect(metadata.description).toBe(
      'Browse available French and English Bulldog puppies near Huntsville, AL. Review current profiles, health information, Falkville-area pickup, and approved delivery options.',
    );
    expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe(
      '/locations/huntsville-al',
    );
    expect(metadata.robots).toBeUndefined();
  });

  it('renders exactly one H1 with the Huntsville, Alabama heading', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'huntsville-al' }) });
    render(component);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(
      'French & English Bulldog Puppies Near Huntsville, Alabama',
    );
  });

  it('renders Huntsville-specific Falkville/pickup copy without the removed claims', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'huntsville-al' }) });
    const { container } = render(component);

    expect(container).toHaveTextContent(/Falkville, Alabama/i);
    expect(container).toHaveTextContent(/Rocket City/i);

    // Removed/unverified claims must not appear.
    expect(container).not.toHaveTextContent(/trust/i);
    expect(container).not.toHaveTextContent(/Redstone Arsenal/i);
    expect(container).not.toHaveTextContent(/military/i);
    expect(container).not.toHaveTextContent(/active-duty/i);
  });

  it('shows only the real available puppy (Nippet) and links its card to /puppies/nippet', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([
      mockPuppy({ id: 'nippet-1', name: 'Nippet', slug: 'nippet', status: 'available' }),
    ]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'huntsville-al' }) });
    render(component);

    expect(getFilteredPuppies).toHaveBeenCalledWith({ status: 'available' });
    expect(screen.getByText('Nippet')).toBeInTheDocument();
    const cardLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.includes('/puppies/nippet'));
    expect(cardLinks.length).toBeGreaterThan(0);
    expect(
      screen.queryByText(/We do not have puppies available for Huntsville families/i),
    ).not.toBeInTheDocument();
  });

  it('requests available puppies only for the Huntsville block', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    // Filtering by status happens in the query layer (getFilteredPuppies); this asserts
    // the page requests only available puppies and doesn't re-filter or widen the query.
    vi.mocked(getFilteredPuppies).mockResolvedValue([
      mockPuppy({ id: 'nippet-1', name: 'Nippet', slug: 'nippet', status: 'available' }),
    ]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'huntsville-al' }) });
    render(component);

    expect(getFilteredPuppies).toHaveBeenCalledWith({ status: 'available' });
  });

  it('shows an honest /contact fallback CTA when no puppies are available', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'huntsville-al' }) });
    render(component);

    expect(
      screen.getByText(/We do not have puppies available for Huntsville families/i),
    ).toBeInTheDocument();
    const contactLinks = screen
      .getAllByRole('link', { name: /contact us/i })
      .filter((link) => link.getAttribute('href') === '/contact');
    expect(contactLinks.length).toBeGreaterThan(0);
  });

  it('includes the required contextual links to /puppies, the health-test guide, and /contact', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'huntsville-al' }) });
    render(component);

    const puppiesLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href') === '/puppies');
    expect(puppiesLinks.length).toBeGreaterThan(0);

    const healthGuideLink = screen.getByRole('link', { name: /review our health-test guide/i });
    expect(healthGuideLink).toHaveAttribute(
      'href',
      '/blog/choose-healthy-bulldog-puppy-health-tests',
    );

    const contactLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href') === '/contact');
    expect(contactLinks.length).toBeGreaterThan(0);
  });

  it('renders valid FAQPage and Breadcrumb structured data', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'huntsville-al' }) });
    const { container } = render(component);

    const faqSchema = document.querySelector('#location-faq-huntsville-al');
    const faqData = JSON.parse(faqSchema?.textContent ?? '{}');
    expect(faqData['@type']).toBe('FAQPage');
    expect(faqData.mainEntity.length).toBeGreaterThan(0);

    const breadcrumbNav = within(container).getByRole('navigation', { name: /breadcrumb/i });
    const breadcrumbSchema = breadcrumbNav.querySelector('script[type="application/ld+json"]');
    const breadcrumbData = JSON.parse(breadcrumbSchema?.textContent ?? '{}');
    expect(breadcrumbData['@type']).toBe('BreadcrumbList');
    expect(breadcrumbData.itemListElement.at(-1).item.name).toBe('Huntsville, AL');
  });
});

describe('Birmingham location page (Batch 2B)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('uses the expected title, meta description, self-canonical, and indexable robots', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'birmingham-al' }) });

    expect(metadata.title).toBe('French & English Bulldog Puppies Near Birmingham, AL');
    expect(metadata.description).toBe(
      'Browse French and English Bulldog puppies available near Birmingham, Alabama. View current profiles and plan Falkville-area pickup, ground transport, or approved delivery.',
    );
    expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe(
      '/locations/birmingham-al',
    );
    expect(metadata.robots).toBeUndefined();
  });

  it('renders exactly one H1 with the required Birmingham, Alabama heading', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'birmingham-al' }) });
    render(component);

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(
      'French & English Bulldog Puppies Near Birmingham, Alabama',
    );
  });

  it('renders Birmingham/Falkville/nearby-community context without the removed claims', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'birmingham-al' }) });
    const { container } = render(component);

    expect(container).toHaveTextContent(/Falkville, Alabama/i);
    expect(container).toHaveTextContent(/Hoover/i);
    expect(container).toHaveTextContent(/Homewood/i);
    expect(container).toHaveTextContent(/Vestavia Hills/i);
    expect(container).toHaveTextContent(/Mountain Brook/i);
    expect(container).toHaveTextContent(/Pelham/i);
    expect(container).toHaveTextContent(/Trussville/i);

    // Removed/unverified claims must not appear.
    expect(container).not.toHaveTextContent(/families have been trusting/i);
    expect(container).not.toHaveTextContent(/we ship nationwide/i);
  });

  it('does not promise unconditional nationwide or direct-to-BHM delivery', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'birmingham-al' }) });
    const { container } = render(component);

    expect(container).not.toHaveTextContent(/we ship nationwide/i);
    expect(container).not.toHaveTextContent(/directly to birmingham-shuttlesworth/i);
    expect(container).toHaveTextContent(/may be arranged/i);
    expect(container).toHaveTextContent(/can be discussed/i);
  });

  it('shows the required "Available Bulldog Puppies for Birmingham Families" section heading and copy', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'birmingham-al' }) });
    render(component);

    expect(
      screen.getByRole('heading', { name: /^Available Bulldog Puppies for Birmingham Families$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Current French and English Bulldog puppy profiles are updated as availability changes/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders an available puppy returned by the query and links to its detail page', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([
      mockPuppy({ id: 'nippet-1', name: 'Nippet', slug: 'nippet', status: 'available' }),
    ]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'birmingham-al' }) });
    render(component);

    expect(getFilteredPuppies).toHaveBeenCalledWith({ status: 'available' });
    expect(screen.getByText('Nippet')).toBeInTheDocument();
    const cardLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.includes('/puppies/nippet'));
    expect(cardLinks.length).toBeGreaterThan(0);
    expect(
      screen.queryByText(/We do not have puppies available for Birmingham families/i),
    ).not.toBeInTheDocument();
  });

  it('shows an honest /contact fallback CTA when no puppies are available', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'birmingham-al' }) });
    render(component);

    expect(
      screen.getByText(/We do not have puppies available for Birmingham families/i),
    ).toBeInTheDocument();
    const contactLinks = screen
      .getAllByRole('link', { name: /contact us/i })
      .filter((link) => link.getAttribute('href') === '/contact');
    expect(contactLinks.length).toBeGreaterThan(0);
  });

  it('includes all five required contextual links to /puppies, the health-test guide, /reviews, /contact, and /terms', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const component = await LocationPage({ params: Promise.resolve({ slug: 'birmingham-al' }) });
    render(component);

    expect(screen.getByRole('link', { name: /see available bulldog puppies/i })).toHaveAttribute(
      'href',
      '/puppies',
    );
    expect(
      screen.getByRole('link', { name: /learn how to review bulldog health tests/i }),
    ).toHaveAttribute('href', '/blog/choose-healthy-bulldog-puppy-health-tests');
    expect(screen.getByRole('link', { name: /read puppy-family reviews/i })).toHaveAttribute(
      'href',
      '/reviews',
    );
    expect(
      screen.getByRole('link', { name: /contact us about birmingham pickup or delivery/i }),
    ).toHaveAttribute('href', '/contact');
    expect(
      screen.getByRole('link', { name: /review deposit and delivery terms/i }),
    ).toHaveAttribute('href', '/terms');
  });

  it('renders visible FAQ answers that match the FAQPage JSON-LD exactly, plus valid Breadcrumb data', async () => {
    const { getFilteredPuppies } = await import('@/lib/supabase/queries');
    vi.mocked(getFilteredPuppies).mockResolvedValue([]);

    const { locations } = await import('@/lib/data/locations');
    const birmingham = locations.find((loc) => loc.slug === 'birmingham-al');
    if (!birmingham) throw new Error('birmingham-al location missing');

    const component = await LocationPage({ params: Promise.resolve({ slug: 'birmingham-al' }) });
    const { container } = render(component);

    for (const item of birmingham.faq) {
      expect(screen.getByText(item.question)).toBeInTheDocument();
      expect(screen.getByText(item.answer)).toBeInTheDocument();
    }

    const faqSchema = document.querySelector('#location-faq-birmingham-al');
    const faqData = JSON.parse(faqSchema?.textContent ?? '{}');
    expect(faqData['@type']).toBe('FAQPage');
    expect(faqData.mainEntity).toEqual(
      birmingham.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    );

    const breadcrumbNav = within(container).getByRole('navigation', { name: /breadcrumb/i });
    const breadcrumbSchema = breadcrumbNav.querySelector('script[type="application/ld+json"]');
    const breadcrumbData = JSON.parse(breadcrumbSchema?.textContent ?? '{}');
    expect(breadcrumbData['@type']).toBe('BreadcrumbList');
    expect(breadcrumbData.itemListElement.at(-1).item.name).toBe('Birmingham, AL');
  });

  it('does not change Huntsville, Cullman, or Decatur location data', async () => {
    const { locations } = await import('@/lib/data/locations');
    const huntsville = locations.find((loc) => loc.slug === 'huntsville-al');
    const cullman = locations.find((loc) => loc.slug === 'cullman-al');
    const decatur = locations.find((loc) => loc.slug === 'decatur-al');

    expect(huntsville?.heroTitle).toBe('French & English Bulldog Puppies Near Huntsville, Alabama');
    expect(huntsville?.faq).toHaveLength(4);
    expect(cullman?.heroTitle).toBe('French & English Bulldog Puppies Near Cullman, Alabama');
    expect(cullman?.faq).toHaveLength(4);
    expect(decatur?.heroTitle).toBe('French & English Bulldog Puppies Near Decatur, Alabama');
    expect(decatur?.faq).toHaveLength(4);
  });
});
