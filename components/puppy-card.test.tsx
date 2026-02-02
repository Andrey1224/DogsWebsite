import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { PuppyWithRelations } from '@/lib/supabase/types';
import { PuppyCard } from './puppy-card';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string }) => (
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

function buildPuppy(overrides: Partial<PuppyWithRelations> = {}): PuppyWithRelations {
  return {
    id: 'puppy-1',
    name: 'Milo',
    slug: 'milo',
    status: 'available',
    price_usd: 2500,
    color: 'Lilac',
    description: 'Playful companion',
    breed: 'english_bulldog',
    birth_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    dam_id: null,
    dam_name: null,
    dam_photo_urls: null,
    dam_color_notes: null,
    dam_health_notes: null,
    dam_temperament_notes: null,
    dam_weight_notes: null,
    litter_id: null,
    paypal_enabled: true,
    photo_urls: ['/puppy.jpg'],
    sex: 'female',
    sire_id: null,
    sire_name: null,
    sire_photo_urls: null,
    sire_color_notes: null,
    sire_health_notes: null,
    sire_temperament_notes: null,
    sire_weight_notes: null,
    stripe_payment_link: null,
    video_urls: null,
    weight_oz: null,
    litter: null,
    parents: { sire: null, dam: null },
    is_archived: false,
    sold_at: null,
    ...overrides,
  };
}

describe('PuppyCard', () => {
  it('renders available puppy with dark theme styling', () => {
    const puppy = buildPuppy();
    render(<PuppyCard puppy={puppy} />);

    const card = screen.getByTestId('puppy-card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-[#151e32]', 'border-slate-800', 'rounded-[2rem]');
  });

  it('displays available status badge with green styling', () => {
    const puppy = buildPuppy({ status: 'available' });
    render(<PuppyCard puppy={puppy} />);

    const badge = screen.getByText(/available/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-500/20', 'text-green-400', 'border-green-500/30');
  });

  it('displays sold status badge with gray styling', () => {
    const puppy = buildPuppy({ status: 'sold' });
    render(<PuppyCard puppy={puppy} />);

    const badge = screen.getByText(/sold/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-slate-500/20', 'text-slate-400', 'border-slate-500/30');
  });

  it('displays reserved status badge with orange styling', () => {
    const puppy = buildPuppy({ status: 'reserved' });
    render(<PuppyCard puppy={puppy} />);

    const badge = screen.getByText(/reserved/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-orange-500/20', 'text-orange-400', 'border-orange-500/30');
  });

  it('renders Reserve Now button for available puppies', () => {
    const puppy = buildPuppy({ status: 'available' });
    render(<PuppyCard puppy={puppy} />);

    const button = screen.getByRole('link', { name: /reserve now/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/puppies/milo');
    expect(button).toHaveClass('bg-orange-500');
  });

  it('renders floating action button for available puppies', () => {
    const puppy = buildPuppy({ status: 'available' });
    render(<PuppyCard puppy={puppy} />);

    const floatingButton = screen.getByRole('link', { name: /view details for milo/i });
    expect(floatingButton).toBeInTheDocument();
    expect(floatingButton).toHaveAttribute('href', '/puppies/milo');
  });

  it('renders floating action button for sold puppies', () => {
    const puppy = buildPuppy({ status: 'sold' });
    render(<PuppyCard puppy={puppy} />);

    const floatingButton = screen.getByRole('link', { name: /view details for milo/i });
    expect(floatingButton).toBeInTheDocument();
    expect(floatingButton).toHaveAttribute('href', '/puppies/milo');
  });

  it('renders floating action button for reserved puppies', () => {
    const puppy = buildPuppy({ status: 'reserved' });
    render(<PuppyCard puppy={puppy} />);

    const floatingButton = screen.getByRole('link', { name: /view details for milo/i });
    expect(floatingButton).toBeInTheDocument();
    expect(floatingButton).toHaveAttribute('href', '/puppies/milo');
  });

  it('renders View Details link for sold puppies', () => {
    const puppy = buildPuppy({ status: 'sold' });
    render(<PuppyCard puppy={puppy} />);

    const link = screen.getByText(/view details/i);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/puppies/milo');
    expect(link).toHaveClass('bg-slate-700');
  });

  it('renders View Details link for reserved puppies', () => {
    const puppy = buildPuppy({ status: 'reserved' });
    render(<PuppyCard puppy={puppy} />);

    const link = screen.getByText(/view details/i);
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/puppies/milo');
  });

  it('does not apply grayscale filter to any puppies', () => {
    const availablePuppy = buildPuppy({ status: 'available' });
    const { rerender } = render(<PuppyCard puppy={availablePuppy} />);
    let image = screen.getByAltText('Milo portrait');
    expect(image).not.toHaveClass('grayscale');

    const soldPuppy = buildPuppy({ status: 'sold' });
    rerender(<PuppyCard puppy={soldPuppy} />);
    image = screen.getByAltText('Milo portrait');
    expect(image).not.toHaveClass('grayscale');

    const reservedPuppy = buildPuppy({ status: 'reserved' });
    rerender(<PuppyCard puppy={reservedPuppy} />);
    image = screen.getByAltText('Milo portrait');
    expect(image).not.toHaveClass('grayscale');
  });

  it('displays pricing with proper formatting', () => {
    const puppy = buildPuppy({ price_usd: 4500 });
    render(<PuppyCard puppy={puppy} />);

    expect(screen.getByText('$4,500')).toBeInTheDocument();
  });

  it('displays contact fallback when price is null', () => {
    const puppy = buildPuppy({ price_usd: null });
    render(<PuppyCard puppy={puppy} />);

    expect(screen.getByText(/contact/i)).toBeInTheDocument();
  });

  it('formats breed labels correctly', () => {
    const puppy = buildPuppy({ breed: 'english_bulldog' });
    render(<PuppyCard puppy={puppy} />);

    expect(screen.getByText(/english bulldog/i)).toBeInTheDocument();
  });

  it('displays puppy name and color', () => {
    const puppy = buildPuppy({ name: 'Luna', color: 'Blue Merle' });
    render(<PuppyCard puppy={puppy} />);

    expect(screen.getByText('Luna')).toBeInTheDocument();
    expect(screen.getByText('Blue Merle')).toBeInTheDocument();
  });

  it('displays puppy description', () => {
    const puppy = buildPuppy({ description: 'Friendly and energetic' });
    render(<PuppyCard puppy={puppy} />);

    expect(screen.getByText('Friendly and energetic')).toBeInTheDocument();
  });

  it('displays default description when description is null', () => {
    const puppy = buildPuppy({ description: null });
    render(<PuppyCard puppy={puppy} />);

    expect(
      screen.getByText(/Affectionate, socialized bulldog with up-to-date health checks/i),
    ).toBeInTheDocument();
  });

  it('optimizes image loading for above-fold cards', () => {
    const puppy = buildPuppy();
    render(<PuppyCard puppy={puppy} index={0} />);

    const image = screen.getByAltText('Milo portrait');
    expect(image).toHaveAttribute('loading', 'eager');
  });

  it('lazy loads images for below-fold cards', () => {
    const puppy = buildPuppy();
    render(<PuppyCard puppy={puppy} index={5} />);

    const image = screen.getByAltText('Milo portrait');
    expect(image).toHaveAttribute('loading', 'lazy');
  });
});
