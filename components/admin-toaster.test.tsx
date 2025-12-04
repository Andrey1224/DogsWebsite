import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminToaster } from './admin-toaster';

// Mock sonner Toaster
vi.mock('sonner', () => ({
  Toaster: (props: unknown) => (
    <div data-testid="sonner-toaster" data-props={JSON.stringify(props)} />
  ),
}));

describe('AdminToaster', () => {
  it('renders the toaster with correct configuration', () => {
    const { getByTestId } = render(<AdminToaster />);

    const toaster = getByTestId('sonner-toaster');
    expect(toaster).toBeInTheDocument();

    const props = JSON.parse(toaster.getAttribute('data-props') || '{}');
    expect(props).toEqual(
      expect.objectContaining({
        position: 'top-center',
        richColors: true,
        closeButton: true,
        duration: 3500,
      }),
    );
  });
});
