/**
 * Reviews Page Tests
 *
 * Tests the Reviews page rendering, accessibility, and structured data.
 * Tests new dark UI with masonry grid and review form.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { expectNoA11yViolations } from '@/tests/helpers/axe';

const mocks = vi.hoisted(() => ({
  getPublishedReviews: vi.fn(),
}));

vi.mock('@/lib/reviews/queries', () => ({
  getPublishedReviews: mocks.getPublishedReviews,
  getAggregate: (reviews: Array<{ rating: number }>) => ({
    averageRating:
      reviews.length === 0
        ? 0
        : Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)),
    reviewCount: reviews.length,
  }),
}));

vi.mock('@/components/reviews/review-form', () => ({
  ReviewForm: () => <div data-testid="review-form">Review Form</div>,
}));

import ReviewsPage from './page';

async function renderReviewsPage() {
  return render(await ReviewsPage());
}

describe('Reviews Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublishedReviews.mockResolvedValue([
      {
        id: 'manual-1',
        source: 'manual',
        isPublished: true,
        isFeatured: false,
        authorName: 'Taylor R.',
        authorLocation: 'Atlanta, GA',
        rating: 4,
        body: 'Great coordination and healthy puppy delivery.',
        visitDate: '2025-09-01',
        photoUrl: null,
        sourceUrl: null,
        createdAt: '2025-09-15T00:00:00.000Z',
        updatedAt: '2025-09-15T00:00:00.000Z',
      },
      {
        id: 'fb-1',
        source: 'facebook_manual',
        isPublished: true,
        isFeatured: true,
        authorName: 'Sarah W.',
        authorLocation: 'Huntsville, AL',
        rating: 5,
        body: 'Transparent process and healthy puppy.',
        visitDate: '2025-06-18',
        photoUrl: '/images/reviews/sarah-charlie.webp',
        sourceUrl: 'https://facebook.com/review/1',
        createdAt: '2025-06-19T00:00:00.000Z',
        updatedAt: '2025-06-19T00:00:00.000Z',
      },
    ]);
  });

  it('renders hero heading with gradient text', async () => {
    await renderReviewsPage();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Families who chose Exotic Bulldog Legacy/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders Verified Reviews badge', async () => {
    await renderReviewsPage();

    expect(screen.getByText(/Verified Reviews/i)).toBeInTheDocument();
  });

  it('renders description text', async () => {
    await renderReviewsPage();

    expect(
      screen.getByText(/From first kennel visits to flight nanny hand-offs/i),
    ).toBeInTheDocument();
  });

  it('renders static stats', async () => {
    await renderReviewsPage();

    expect(screen.getByText(/Average Rating/i)).toBeInTheDocument();
    expect(screen.getByText('5.0 / 5.0')).toBeInTheDocument();
    expect(screen.getByText(/Happy Families/i)).toBeInTheDocument();
    expect(screen.getByText('120+')).toBeInTheDocument();
    expect(screen.getByText(/States Served/i)).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('displays review cards without badges', async () => {
    await renderReviewsPage();

    expect(screen.getByText(/Taylor R\./i)).toBeInTheDocument();
    expect(screen.getByText(/Sarah W\./i)).toBeInTheDocument();
    expect(screen.getByText(/Great coordination and healthy puppy delivery./i)).toBeInTheDocument();
    expect(screen.getByText(/Transparent process and healthy puppy./i)).toBeInTheDocument();

    // Badges should not be present
    expect(screen.queryByText(/From EBL Family/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/From Facebook review/i)).not.toBeInTheDocument();
  });

  it('renders the submission form', async () => {
    await renderReviewsPage();

    expect(screen.getByTestId('review-form')).toBeInTheDocument();
  });

  it('shows empty state when no reviews', async () => {
    mocks.getPublishedReviews.mockResolvedValueOnce([]);

    await renderReviewsPage();

    expect(screen.getByText(/No reviews published yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Once we approve the first story it will appear here/i),
    ).toBeInTheDocument();
  });

  it('renders breadcrumbs (sr-only for SEO)', async () => {
    await renderReviewsPage();

    const nav = screen.getByRole('navigation', { name: /Breadcrumb/i });
    expect(nav).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: /Home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('has dark theme background', async () => {
    const { container } = await renderReviewsPage();

    const mainContainer = container.querySelector('.bg-\\[\\#0B1120\\]');
    expect(mainContainer).toBeInTheDocument();
  });

  it('renders JSON-LD structured data', async () => {
    const { container } = await renderReviewsPage();

    const jsonLdScripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(jsonLdScripts.length).toBeGreaterThan(0);

    // Find the aggregate rating schema
    const schemas = Array.from(jsonLdScripts).map((script) =>
      JSON.parse(script.textContent || '{}'),
    );
    const aggregateSchema = schemas.find(
      (schema) => schema['@type'] === 'Organization' && schema.aggregateRating,
    );

    expect(aggregateSchema).toBeTruthy();
    expect(aggregateSchema?.aggregateRating['@type']).toBe('AggregateRating');
  });

  it('passes accessibility checks', async () => {
    const { container } = await renderReviewsPage();
    await expectNoA11yViolations(container);
    expect(container).toBeTruthy();
  });
});
