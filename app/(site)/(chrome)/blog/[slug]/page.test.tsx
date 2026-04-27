import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ArticlePage from './page';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    fill: _fill,
    priority: _priority,
    ...props
  }: {
    alt: string;
    fill?: boolean;
    priority?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
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
});
