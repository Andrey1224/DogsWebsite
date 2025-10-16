import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AboutPage from './page';

describe('About Page', () => {
  it('renders hero heading', () => {
    render(<AboutPage />);

    expect(
      screen.getByRole('heading', {
        name: /A boutique breeding program built on trust, transparency, and care/i,
      })
    ).toBeInTheDocument();
  });

  it('renders all three pillars', () => {
    render(<AboutPage />);

    expect(screen.getByText(/Health-first philosophy/i)).toBeInTheDocument();
    expect(screen.getByText(/Enrichment-driven raising/i)).toBeInTheDocument();
    expect(screen.getByText(/Lifetime breeder support/i)).toBeInTheDocument();
  });

  it('displays facility information', () => {
    render(<AboutPage />);

    expect(screen.getByText(/Our facility/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Puppies are raised in-home with dedicated nursery/i)
    ).toBeInTheDocument();
  });

  it('displays veterinary partners information', () => {
    render(<AboutPage />);

    expect(screen.getByText(/Veterinary partners/i)).toBeInTheDocument();
    expect(
      screen.getByText(/board-certified reproductive veterinarians/i)
    ).toBeInTheDocument();
  });

  it('includes CTA for kennel visit', () => {
    render(<AboutPage />);

    expect(screen.getByText(/Schedule a kennel visit/i)).toBeInTheDocument();
    expect(
      screen.getByText(/appointment-only visits in Montgomery, AL/i)
    ).toBeInTheDocument();
  });

  it('renders breadcrumbs navigation', () => {
    render(<AboutPage />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
  });
});
