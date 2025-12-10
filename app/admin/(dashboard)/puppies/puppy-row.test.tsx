import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AdminPuppyRecordWithState } from '@/lib/admin/puppies/queries';
import { PuppyRow } from './puppy-row';
import * as actions from './actions';

// Mock modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock actions
vi.mock('./actions', () => ({
  updatePuppyStatusAction: vi.fn(),
  updatePuppyPriceAction: vi.fn(),
  archivePuppyAction: vi.fn(),
  deletePuppyAction: vi.fn(),
  restorePuppyAction: vi.fn(),
}));

// Mock EditPuppyPanel (to avoid rendering the full form)
vi.mock('./edit-puppy-panel', () => ({
  EditPuppyPanel: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="edit-panel">
      <button onClick={onClose}>Close Panel</button>
    </div>
  ),
}));

describe('PuppyRow', () => {
  const mockPuppy: AdminPuppyRecordWithState = {
    id: 'puppy-123',
    slug: 'duddy-the-bulldog',
    name: 'Duddy',
    status: 'available',
    price_usd: 4500,
    birth_date: '2024-01-01',
    photo_urls: ['/img1.jpg'],
    has_active_reservation: false,
    litter_id: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    is_archived: false,
  };

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'sold', label: 'Sold' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders puppy information correctly', () => {
    // Use a date that is safe across timezones (midday UTC)
    const puppyWithSafeDate = { ...mockPuppy, birth_date: '2024-01-15T12:00:00Z' };

    render(<PuppyRow puppy={puppyWithSafeDate} statusOptions={statusOptions} archived={false} />);

    expect(screen.getByText('Duddy')).toBeInTheDocument();
    expect(screen.getByText('duddy-the-bulldog')).toBeInTheDocument();

    // Check formatted date (Jan 15, 2024)
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();

    // Check image
    const img = screen.getByAltText('Duddy');
    expect(img).toHaveAttribute('src', '/img1.jpg');
  });

  it('renders inputs for price and status', () => {
    render(<PuppyRow puppy={mockPuppy} statusOptions={statusOptions} archived={false} />);

    const priceInput = screen.getByPlaceholderText('0.00');
    expect(priceInput).toHaveValue(4500);

    const statusSelect = screen.getByRole('combobox');
    expect(statusSelect).toHaveValue('available');
  });

  it('shows active reservation indicator', () => {
    render(
      <PuppyRow
        puppy={{ ...mockPuppy, has_active_reservation: true }}
        statusOptions={statusOptions}
        archived={false}
      />,
    );

    expect(screen.getByTitle('Active Reservation')).toBeInTheDocument();
  });

  it('calls updatePuppyStatusAction when status is changed', async () => {
    (actions.updatePuppyStatusAction as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
    });

    render(<PuppyRow puppy={mockPuppy} statusOptions={statusOptions} archived={false} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'reserved' } });

    await waitFor(() => {
      expect(actions.updatePuppyStatusAction).toHaveBeenCalledWith({
        id: 'puppy-123',
        status: 'reserved',
        slug: 'duddy-the-bulldog',
      });
    });
  });

  it('calls updatePuppyPriceAction when price is saved', async () => {
    (actions.updatePuppyPriceAction as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
    });

    render(<PuppyRow puppy={mockPuppy} statusOptions={statusOptions} archived={false} />);

    const input = screen.getByPlaceholderText('0.00');
    fireEvent.change(input, { target: { value: '5000' } });

    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(actions.updatePuppyPriceAction).toHaveBeenCalledWith({
        id: 'puppy-123',
        priceUsd: '5000',
        slug: 'duddy-the-bulldog',
      });
    });
  });

  it('opens edit panel when Edit button is clicked', () => {
    render(<PuppyRow puppy={mockPuppy} statusOptions={statusOptions} archived={false} />);

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(screen.getByTestId('edit-panel')).toBeInTheDocument();
  });

  it('handles archive flow', async () => {
    (actions.archivePuppyAction as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
    });

    render(<PuppyRow puppy={mockPuppy} statusOptions={statusOptions} archived={false} />);

    // Initial "Archive" button
    const initArchiveBtn = screen.getByRole('button', { name: /^archive$/i });
    fireEvent.click(initArchiveBtn);

    // Confirm "Archive" button inside confirmation UI (it might be "Confirm")
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(actions.archivePuppyAction).toHaveBeenCalledWith({
        id: 'puppy-123',
        slug: 'duddy-the-bulldog',
      });
    });
  });

  it('blocks archiving if reservation is active', () => {
    render(
      <PuppyRow
        puppy={{ ...mockPuppy, has_active_reservation: true }}
        statusOptions={statusOptions}
        archived={false}
      />,
    );

    // Should not find "Archive" button
    expect(screen.queryByRole('button', { name: /^archive$/i })).not.toBeInTheDocument();

    // Should see "Reservation active" message
    // Using getAllByText because it appears in two places (desktop/mobile layout)
    const messages = screen.getAllByText(/reservation active/i);
    expect(messages.length).toBeGreaterThan(0);
  });

  it('renders restore and delete buttons when archived', () => {
    render(<PuppyRow puppy={mockPuppy} statusOptions={statusOptions} archived={true} />);

    expect(screen.getByRole('button', { name: /restore/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete permanently/i })).toBeInTheDocument();
    // Edit button should not be visible for archived items
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
  });
});
