import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ArticlePage, { generateMetadata } from './page';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    fill,
    priority,
    ...props
  }: {
    alt: string;
    fill?: boolean;
    priority?: boolean;
  }) => {
    void fill;
    void priority;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt} {...props} />
    );
  },
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('notFound');
  }),
}));

vi.mock('@/sanity/lib/client', () => ({
  sanityFetch: vi.fn(),
}));

vi.mock('@/sanity/lib/image', () => ({
  urlFor: vi.fn(() => ({
    width: vi.fn().mockReturnThis(),
    height: vi.fn().mockReturnThis(),
    fit: vi.fn().mockReturnThis(),
    auto: vi.fn().mockReturnThis(),
    url: vi.fn(() => 'https://images.example.com/post.jpg'),
  })),
}));

vi.mock('@/components/blog/portable-text', () => ({
  BlogPortableText: () => <div>Portable text body</div>,
}));

vi.mock('./share-buttons', () => ({
  ShareButtons: () => <div>Share buttons</div>,
}));

describe('ArticlePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the article CTA with service area link', async () => {
    const { sanityFetch } = await import('@/sanity/lib/client');

    vi.mocked(sanityFetch)
      .mockResolvedValueOnce({
        _id: 'post-1',
        title: 'How pickup works',
        slug: { current: 'how-pickup-works' },
        excerpt: 'Pickup and delivery overview.',
        category: 'Care',
        publishedAt: '2026-01-01T00:00:00.000Z',
        readTime: '5 min',
        mainImage: { asset: { _ref: 'image-ref' }, alt: 'Puppy' },
        featured: false,
        body: [],
      })
      .mockResolvedValueOnce([]);

    const component = await ArticlePage({
      params: Promise.resolve({ slug: 'how-pickup-works' }),
    });
    render(component);

    expect(screen.getByRole('link', { name: /view puppies/i })).toHaveAttribute('href', '/puppies');
    expect(screen.getByRole('link', { name: /view service areas/i })).toHaveAttribute(
      'href',
      '/locations',
    );
  });

  it('renders the local nutrition article with required internal links', async () => {
    const { sanityFetch } = await import('@/sanity/lib/client');

    vi.mocked(sanityFetch).mockResolvedValueOnce([]);

    const component = await ArticlePage({
      params: Promise.resolve({ slug: 'dry-food-vs-raw-diet-bulldogs' }),
    });
    render(component);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Dry Food vs\. Raw Diet/i);
    expect(screen.getByRole('link', { name: /view our available puppies/i })).toHaveAttribute(
      'href',
      '/puppies',
    );
    expect(screen.getByRole('link', { name: /contact exotic bulldog legacy/i })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.getByRole('link', { name: /read our faq/i })).toHaveAttribute('href', '/faq');
    expect(screen.getByRole('link', { name: /review health & deposit policies/i })).toHaveAttribute(
      'href',
      '/terms',
    );
    expect(screen.getByRole('link', { name: /pickup & delivery in alabama/i })).toHaveAttribute(
      'href',
      '/locations',
    );
    expect(screen.getByRole('img', { name: /tatiana — author/i })).toHaveAttribute(
      'src',
      '/images/tatiana-author.webp',
    );

    const articleSchema = document.querySelector('#blog-posting-dry-food-vs-raw-diet-bulldogs');
    const breadcrumbSchema = document.querySelector(
      'nav[aria-label="Breadcrumb"] script[type="application/ld+json"]',
    );

    expect(articleSchema).not.toBeNull();
    expect(JSON.parse(articleSchema?.textContent ?? '{}')).toMatchObject({
      '@type': 'BlogPosting',
      headline: expect.stringMatching(/Dry Food vs\. Raw Diet/i),
    });
    expect(breadcrumbSchema).not.toBeNull();
  });

  it.each([
    ['ultimate-guide-for-new-bulldog-owners', /preparing for a bulldog puppy in alabama/i],
    ['puppy-potty-training-101', /start the routine before your alabama pickup/i],
  ])('links the local article %s to both priority city pages', async (slug, sectionHeading) => {
    const { sanityFetch } = await import('@/sanity/lib/client');

    vi.mocked(sanityFetch).mockResolvedValueOnce([]);

    const component = await ArticlePage({ params: Promise.resolve({ slug }) });
    render(component);

    expect(screen.getByRole('heading', { name: sectionHeading })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /huntsville/i })).toHaveAttribute(
      'href',
      '/locations/huntsville-al',
    );
    expect(screen.getByRole('link', { name: /birmingham/i })).toHaveAttribute(
      'href',
      '/locations/birmingham-al',
    );
    expect(screen.getByText(/Updated: August 2, 2026/i)).toBeInTheDocument();

    const articleSchema = document.querySelector(`#blog-posting-${slug}`);
    expect(JSON.parse(articleSchema?.textContent ?? '{}')).toMatchObject({
      '@type': 'BlogPosting',
      dateModified: '2026-08-02T21:30:00.000Z',
    });
  });

  it('uses search-focused metadata for the new potty-training article', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'puppy-potty-training-101' }),
    });

    expect(metadata.title).toBe('How to Potty Train a Puppy: Step-by-Step');
    expect(metadata.description).toMatch(/pads or outdoor trips/i);
    expect(new URL(String(metadata.alternates?.canonical)).pathname).toBe(
      '/blog/puppy-potty-training-101',
    );
  });
});
