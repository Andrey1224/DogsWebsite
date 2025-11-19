import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPublishedReviews: vi.fn(),
}));

vi.mock('@/lib/reviews/queries', () => ({
  getPublishedReviews: mocks.getPublishedReviews,
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
        id: 'community-1',
        author: 'Taylor R.',
        location: 'Atlanta, GA',
        visitDate: '2025-09-01',
        rating: 5,
        story: 'Amazing coordination and healthy puppy delivery.',
        createdAt: '2025-09-15T00:00:00.000Z',
        photoUrls: ['https://example.supabase.co/storage/v1/object/public/reviews/community-1.jpg'],
      },
    ]);
  });

  it('renders hero heading', async () => {
    await renderReviewsPage();

    expect(
      screen.getByRole('heading', {
        name: /Families who chose Exotic Bulldog Legacy/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders hero description', async () => {
    await renderReviewsPage();

    expect(
      screen.getByText(/our team stays involved at every step of the adoption journey/i),
    ).toBeInTheDocument();
  });

  it('displays community and featured reviews', async () => {
    await renderReviewsPage();

    expect(screen.getByText(/Taylor R\./i)).toBeInTheDocument();
    expect(screen.getByText(/Sarah W\./i)).toBeInTheDocument();
    expect(screen.getByText(/Mark & Lisa P\./i)).toBeInTheDocument();
  });

  it('displays review locations', async () => {
    await renderReviewsPage();

    expect(screen.getAllByText(/Huntsville, AL/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Birmingham, AL/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Atlanta, GA/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Nashville, TN/i).length).toBeGreaterThan(0);
  });

  it('displays star ratings', async () => {
    await renderReviewsPage();

    // All reviews are 5-star, check for multiple instances of "5 out of 5 stars"
    const ratingElements = screen.getAllByText(/5 out of 5 stars/i);
    expect(ratingElements.length).toBeGreaterThan(0);
  });

  it('includes CTA to contact the team', async () => {
    await renderReviewsPage();

    expect(screen.getByText(/Ready to plan your bulldog match\?/i)).toBeInTheDocument();

    const contactLink = screen.getByRole('link', { name: /Contact the team/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('renders breadcrumbs navigation', async () => {
    await renderReviewsPage();

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getAllByText('Reviews').length).toBeGreaterThan(0);
  });

  it('displays visit dates in readable format', async () => {
    await renderReviewsPage();

    // Check for formatted dates
    expect(screen.getByText(/Visited June 2025/i)).toBeInTheDocument();
    const julyDates = screen.getAllByText(/Visited July 2025/i);
    expect(julyDates.length).toBeGreaterThan(0);
    const septemberDates = screen.getAllByText(/Visited September 2025/i);
    expect(septemberDates.length).toBeGreaterThan(0);
  });

  it('renders review quotes', async () => {
    await renderReviewsPage();

    expect(screen.getByText(/We picked up our French Bulldog, Charlie/i)).toBeInTheDocument();
    expect(screen.getByText(/Our English Bulldog Duke is doing amazing/i)).toBeInTheDocument();
    expect(screen.getByText(/Amazing coordination/i)).toBeInTheDocument();
  });

  it('renders the submission form placeholder', async () => {
    await renderReviewsPage();

    expect(screen.getByTestId('review-form')).toBeInTheDocument();
  });
});
