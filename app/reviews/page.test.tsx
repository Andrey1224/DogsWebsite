import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ReviewsPage from './page';

describe('Reviews Page', () => {
  it('renders hero heading', () => {
    render(<ReviewsPage />);

    expect(
      screen.getByRole('heading', {
        name: /Families who chose Exotic Bulldog Legacy/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders hero description', () => {
    render(<ReviewsPage />);

    expect(
      screen.getByText(/our team stays involved at every step of the adoption journey/i),
    ).toBeInTheDocument();
  });

  it('displays all customer reviews', () => {
    render(<ReviewsPage />);

    // Check for some review authors
    expect(screen.getByText(/Sarah W\./i)).toBeInTheDocument();
    expect(screen.getByText(/Mark & Lisa P\./i)).toBeInTheDocument();
    expect(screen.getByText(/Jessica M\./i)).toBeInTheDocument();
    expect(screen.getByText(/Anthony D\./i)).toBeInTheDocument();
    expect(screen.getByText(/Rachel K\./i)).toBeInTheDocument();
    expect(screen.getByText(/Cameron H\./i)).toBeInTheDocument();
  });

  it('displays review locations', () => {
    render(<ReviewsPage />);

    expect(screen.getByText(/Huntsville, AL/i)).toBeInTheDocument();
    expect(screen.getByText(/Birmingham, AL/i)).toBeInTheDocument();
    expect(screen.getByText(/Nashville, TN/i)).toBeInTheDocument();
  });

  it('displays star ratings', () => {
    render(<ReviewsPage />);

    // All reviews are 5-star, check for multiple instances of "5 out of 5 stars"
    const ratingElements = screen.getAllByText(/5 out of 5 stars/i);
    expect(ratingElements.length).toBeGreaterThan(0);
  });

  it('includes CTA to contact the team', () => {
    render(<ReviewsPage />);

    expect(screen.getByText(/Ready to plan your bulldog match\?/i)).toBeInTheDocument();

    const contactLink = screen.getByRole('link', { name: /Contact the team/i });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('renders breadcrumbs navigation', () => {
    render(<ReviewsPage />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getAllByText('Reviews').length).toBeGreaterThan(0);
  });

  it('displays visit dates in readable format', () => {
    render(<ReviewsPage />);

    // Check for formatted dates
    expect(screen.getByText(/Visited June 2025/i)).toBeInTheDocument();
    const julyDates = screen.getAllByText(/Visited July 2025/i);
    expect(julyDates.length).toBeGreaterThan(0);
  });

  it('renders review quotes', () => {
    render(<ReviewsPage />);

    expect(screen.getByText(/We picked up our French Bulldog, Charlie/i)).toBeInTheDocument();
    expect(screen.getByText(/Our English Bulldog Duke is doing amazing/i)).toBeInTheDocument();
  });
});
