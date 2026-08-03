import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnchorHTMLAttributes } from 'react';

import LocationPage, { generateMetadata, generateStaticParams } from './page';

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
        'A $300 non-refundable deposit secures your pick from the litter. The deposit is applied to the final purchase price.',
      ),
    ).toBeInTheDocument();
  });

  it('renders an honest Birmingham family note instead of fake testimonials', async () => {
    const component = await LocationPage({ params: Promise.resolve({ slug: 'birmingham-al' }) });
    render(component);

    expect(screen.getByRole('heading', { name: /^Birmingham Families$/i })).toBeInTheDocument();
    expect(
      screen.getByText(/currently collecting approved stories from Birmingham-area families/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /read verified reviews/i })).toHaveAttribute(
      'href',
      '/reviews',
    );
    expect(screen.getAllByRole('link', { name: /contact us/i })[0]).toHaveAttribute(
      'href',
      '/contact',
    );
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
          .some((link) => link.getAttribute('href') === '/policies'),
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
