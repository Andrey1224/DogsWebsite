import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PuppyDetailPage from './page';
import { notFound } from 'next/navigation';
import { getPuppiesWithRelations } from '@/lib/supabase/queries';
import { getPuppyReservationState } from '@/lib/reservations/state';

// Mock dependencies
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  useRouter: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}));

// Mock Supabase queries
vi.mock('@/lib/supabase/queries', () => ({
  getPuppyBySlug: vi.fn(),
  getPuppiesWithRelations: vi.fn(),
}));

// Mock Reservation State
vi.mock('@/lib/reservations/state', () => ({
  getPuppyReservationState: vi.fn(),
}));

// Mock Deposit Calculation
vi.mock('@/lib/payments/deposit', () => ({
  calculateDepositAmount: vi.fn().mockReturnValue({
    amount: 300,
    currency: 'USD',
    formatted: '$300.00',
  }),
}));

// Mock complex child components to simplify integration test
vi.mock('@/components/puppy-gallery', () => ({
  PuppyGallery: () => <div data-testid="puppy-gallery">Gallery</div>,
}));

vi.mock('@/components/puppy-detail/stats-grid', () => ({
  StatsGrid: () => <div data-testid="stats-grid">StatsGrid</div>,
}));

vi.mock('@/components/puppy-detail/parent-card', () => ({
  ParentCard: ({ name, role }: { name: string; role: string }) => (
    <div data-testid={`parent-card-${role}`}>{name}</div>
  ),
}));

vi.mock('./reserve-button', () => ({
  ReserveButton: () => <button>Reserve</button>,
}));

describe('PuppyDetailPage', () => {
  const mockPuppy = {
    id: 'puppy-1',
    slug: 'duddy',
    name: 'Duddy',
    status: 'available',
    price_usd: 4500,
    birth_date: '2024-01-01',
    photo_urls: ['/img1.jpg'],
    description: 'A cute puppy',
    breed: 'french_bulldog',
    sex: 'Male',
    color: 'Blue',
    weight_oz: 20,
    litter_id: 'litter-1',
    parents: {
      sire: { name: 'SireDog', photo_urls: ['/sire.jpg'], breed: 'french_bulldog' },
      dam: { name: 'DamDog', photo_urls: ['/dam.jpg'], breed: 'french_bulldog' },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders puppy details when found', async () => {
    (getPuppyReservationState as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      puppy: mockPuppy,
      canReserve: true,
      reservationBlocked: false,
    });
    (getPuppiesWithRelations as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([mockPuppy]);

    const params = Promise.resolve({ slug: 'duddy' });
    const Page = await PuppyDetailPage({ params });

    render(Page);

    // Use heading to be specific (Duddy appears in breadcrumbs too)
    expect(screen.getByRole('heading', { name: 'Duddy' })).toBeInTheDocument();
    expect(screen.getByText('$4,500')).toBeInTheDocument();
    expect(screen.getByText('A cute puppy')).toBeInTheDocument();

    // Check child components rendered
    expect(screen.getByTestId('puppy-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('stats-grid')).toBeInTheDocument();
    expect(screen.getByText('Reserve')).toBeInTheDocument();
  });

  it('calls notFound when puppy is not returned', async () => {
    (getPuppyReservationState as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const params = Promise.resolve({ slug: 'missing-puppy' });

    await expect(PuppyDetailPage({ params })).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('renders lineage section correctly', async () => {
    (getPuppyReservationState as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      puppy: mockPuppy,
    });
    (getPuppiesWithRelations as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([mockPuppy]);

    const params = Promise.resolve({ slug: 'duddy' });
    const Page = await PuppyDetailPage({ params });
    render(Page);

    expect(screen.getByTestId('parent-card-sire')).toHaveTextContent('SireDog');
    expect(screen.getByTestId('parent-card-dam')).toHaveTextContent('DamDog');
  });

  it('renders related puppies', async () => {
    const relatedPuppy = {
      ...mockPuppy,
      id: 'puppy-2',
      name: 'Brother',
      slug: 'brother',
    };

    (getPuppyReservationState as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      puppy: mockPuppy,
    });
    // Mock returning the main puppy + a related one
    (getPuppiesWithRelations as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      mockPuppy,
      relatedPuppy,
    ]);

    const params = Promise.resolve({ slug: 'duddy' });
    const Page = await PuppyDetailPage({ params });
    render(Page);

    expect(screen.getByRole('heading', { name: 'You may also love' })).toBeInTheDocument();
  });
});
