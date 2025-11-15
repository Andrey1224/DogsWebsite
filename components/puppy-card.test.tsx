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
    litter_id: null,
    paypal_enabled: true,
    photo_urls: ['/puppy.jpg'],
    sex: 'female',
    sire_id: null,
    sire_name: null,
    sire_photo_urls: null,
    stripe_payment_link: null,
    video_urls: null,
    weight_oz: null,
    litter: null,
    parents: { sire: null, dam: null },
    is_archived: false,
    ...overrides,
  };
}

describe('PuppyCard', () => {
  it('renders available puppy details with CTA link', () => {
    const puppy = buildPuppy();
    render(<PuppyCard puppy={puppy} />);

    expect(screen.getByTestId('puppy-card')).toBeInTheDocument();
    expect(screen.getByText(/available/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toHaveAttribute('href', '/puppies/milo');
  });

  it('displays reserved status and pricing fallback', () => {
    const puppy = buildPuppy({
      status: 'reserved',
      price_usd: null,
    });
    render(<PuppyCard puppy={puppy} />);

    expect(screen.getByText(/reserved/i)).toBeInTheDocument();
    expect(screen.getByText(/contact for pricing/i)).toBeInTheDocument();
  });

  it('formats breed labels and shows sold status', () => {
    const puppy = buildPuppy({
      status: 'sold',
      breed: 'english_bulldog',
    });
    render(<PuppyCard puppy={puppy} />);

    expect(screen.getByText(/english bulldog/i)).toBeInTheDocument();
    expect(screen.getByText(/sold/i)).toBeInTheDocument();
  });
});
