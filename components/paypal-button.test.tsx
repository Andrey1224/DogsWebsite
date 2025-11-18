/**
 * PayPal Button Component Tests
 *
 * Tests PayPal SDK initialization, order creation, capture flow, error handling,
 * and cleanup. Critical for payment processing reliability.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayPalButton } from './paypal-button';
import { loadScript } from '@paypal/paypal-js';

// Mock PayPal SDK
vi.mock('@paypal/paypal-js');

const mockRender = vi.fn();
const mockClose = vi.fn();
const mockIsEligible = vi.fn(() => true);

const mockButtons = vi.fn(() => ({
  render: mockRender,
  close: mockClose,
  isEligible: mockIsEligible,
}));

const mockPayPalSDK = {
  Buttons: mockButtons,
};

// Mock fetch
global.fetch = vi.fn();

describe('PayPalButton', () => {
  const mockProps = {
    clientId: 'test-client-id',
    puppySlug: 'bella',
    onProcessingChange: vi.fn(),
    onError: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRender.mockResolvedValue(undefined);
    mockClose.mockResolvedValue(undefined);
    mockIsEligible.mockReturnValue(true);
    vi.mocked(loadScript).mockResolvedValue(mockPayPalSDK);
  });

  it('renders container with aria-live attribute', () => {
    const { container } = render(<PayPalButton {...mockProps} />);

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('applies disabled styles when disabled prop is true', () => {
    const { container } = render(<PayPalButton {...mockProps} disabled={true} />);

    const wrapper = container.querySelector('.pointer-events-none.opacity-60');
    expect(wrapper).toBeInTheDocument();
  });

  it('does not apply disabled styles when disabled prop is false', () => {
    const { container } = render(<PayPalButton {...mockProps} disabled={false} />);

    const wrapper = container.querySelector('.pointer-events-none');
    expect(wrapper).not.toBeInTheDocument();
  });

  it('calls onError when clientId is null', async () => {
    render(<PayPalButton {...mockProps} clientId={null} />);

    await waitFor(() => {
      expect(mockProps.onError).toHaveBeenCalledWith(
        'PayPal is not configured yet. Please contact support to enable this payment method.',
      );
    });

    expect(loadScript).not.toHaveBeenCalled();
  });

  it('loads PayPal SDK with correct configuration', async () => {
    render(<PayPalButton {...mockProps} />);

    await waitFor(() => {
      expect(loadScript).toHaveBeenCalledWith({
        clientId: 'test-client-id',
        components: 'buttons',
        currency: 'USD',
        intent: 'capture',
        disableFunding: 'credit,card',
      });
    });
  });

  it('calls onError when PayPal SDK fails to load', async () => {
    vi.mocked(loadScript).mockResolvedValue(null);

    render(<PayPalButton {...mockProps} />);

    await waitFor(() => {
      expect(loadScript).toHaveBeenCalled();
    });

    // Should not attempt to render buttons
    expect(mockRender).not.toHaveBeenCalled();
  });

  it('calls onError when Buttons component is not available', async () => {
    vi.mocked(loadScript).mockResolvedValue({});

    render(<PayPalButton {...mockProps} />);

    await waitFor(() => {
      expect(mockProps.onError).toHaveBeenCalledWith(
        'PayPal SDK did not provide the Buttons component. Please refresh and try again.',
      );
    });
  });

  it('initializes PayPal button with correct style options', async () => {
    render(<PayPalButton {...mockProps} />);

    await waitFor(() => {
      expect(mockButtons).toHaveBeenCalledWith(
        expect.objectContaining({
          style: {
            layout: 'horizontal',
            color: 'gold',
            shape: 'pill',
            label: 'paypal',
          },
        }),
      );
    });
  });

  it('calls onError when button is not eligible', async () => {
    mockIsEligible.mockReturnValue(false);

    render(<PayPalButton {...mockProps} />);

    await waitFor(() => {
      expect(mockProps.onError).toHaveBeenCalledWith(
        'PayPal is unavailable in your region or browser.',
      );
    });

    expect(mockRender).not.toHaveBeenCalled();
  });

  it('renders button when eligible', async () => {
    render(<PayPalButton {...mockProps} />);

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    });
  });

  describe('createOrder flow', () => {
    it('creates order successfully and returns orderId', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ orderId: 'ORDER-123' }),
      });

      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      // Extract createOrder callback
      const buttonOptions = mockButtons.mock.calls[0][0];
      const orderId = await buttonOptions.createOrder();

      expect(mockProps.onProcessingChange).toHaveBeenCalledWith(true);
      expect(mockProps.onError).toHaveBeenCalledWith(null);
      expect(global.fetch).toHaveBeenCalledWith('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puppySlug: 'bella' }),
      });
      expect(orderId).toBe('ORDER-123');
    });

    it('handles createOrder API error with error message', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Puppy is no longer available' }),
      });

      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      const buttonOptions = mockButtons.mock.calls[0][0];

      await expect(buttonOptions.createOrder()).rejects.toThrow('Puppy is no longer available');

      expect(mockProps.onError).toHaveBeenCalledWith('Puppy is no longer available');
      expect(mockProps.onProcessingChange).toHaveBeenCalledWith(false);
    });

    it('handles createOrder API error without error message', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      const buttonOptions = mockButtons.mock.calls[0][0];

      await expect(buttonOptions.createOrder()).rejects.toThrow(
        'Unable to create PayPal order. Please try again.',
      );

      expect(mockProps.onError).toHaveBeenCalledWith(
        'Unable to create PayPal order. Please try again.',
      );
    });

    it('handles createOrder missing orderId in response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      const buttonOptions = mockButtons.mock.calls[0][0];

      await expect(buttonOptions.createOrder()).rejects.toThrow();
    });
  });

  describe('onApprove flow', () => {
    it('captures order successfully and calls onSuccess', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, captureId: 'CAPTURE-456' }),
      });

      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      const buttonOptions = mockButtons.mock.calls[0][0];
      await buttonOptions.onApprove({ orderID: 'ORDER-123' });

      expect(global.fetch).toHaveBeenCalledWith('/api/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: 'ORDER-123' }),
      });

      expect(mockProps.onSuccess).toHaveBeenCalledWith('CAPTURE-456');
      expect(mockProps.onProcessingChange).toHaveBeenCalledWith(false);
    });

    it('handles capture API error with error message', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Order already captured' }),
      });

      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      const buttonOptions = mockButtons.mock.calls[0][0];

      await expect(buttonOptions.onApprove({ orderID: 'ORDER-123' })).rejects.toThrow(
        'Order already captured',
      );

      expect(mockProps.onError).toHaveBeenCalledWith('Order already captured');
      expect(mockProps.onProcessingChange).toHaveBeenCalledWith(false);
    });

    it('handles capture API error without error message', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      const buttonOptions = mockButtons.mock.calls[0][0];

      await expect(buttonOptions.onApprove({ orderID: 'ORDER-123' })).rejects.toThrow(
        'Unable to capture PayPal order. Please contact support.',
      );

      expect(mockProps.onError).toHaveBeenCalledWith(
        'Unable to capture PayPal order. Please contact support.',
      );
    });

    it('handles capture success:false response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, error: 'Reservation failed' }),
      });

      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      const buttonOptions = mockButtons.mock.calls[0][0];

      await expect(buttonOptions.onApprove({ orderID: 'ORDER-123' })).rejects.toThrow(
        'Reservation failed',
      );

      expect(mockProps.onError).toHaveBeenCalledWith('Reservation failed');
    });

    it('calls onProcessingChange(false) even on error', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      const buttonOptions = mockButtons.mock.calls[0][0];

      await expect(buttonOptions.onApprove({ orderID: 'ORDER-123' })).rejects.toThrow();

      expect(mockProps.onProcessingChange).toHaveBeenCalledWith(false);
    });
  });

  describe('onCancel callback', () => {
    it('resets processing state and clears errors on cancel', async () => {
      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      const buttonOptions = mockButtons.mock.calls[0][0];
      buttonOptions.onCancel();

      expect(mockProps.onProcessingChange).toHaveBeenCalledWith(false);
      expect(mockProps.onError).toHaveBeenCalledWith(null);
    });
  });

  describe('onError callback', () => {
    it('handles Error object in onError', async () => {
      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      const buttonOptions = mockButtons.mock.calls[0][0];
      buttonOptions.onError(new Error('PayPal timeout'));

      expect(mockProps.onProcessingChange).toHaveBeenCalledWith(false);
      expect(mockProps.onError).toHaveBeenCalledWith('PayPal timeout');
    });

    it('handles non-Error object in onError', async () => {
      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockButtons).toHaveBeenCalled();
      });

      const buttonOptions = mockButtons.mock.calls[0][0];
      buttonOptions.onError('Unknown error');

      expect(mockProps.onProcessingChange).toHaveBeenCalledWith(false);
      expect(mockProps.onError).toHaveBeenCalledWith('PayPal encountered an unexpected error.');
    });
  });

  describe('cleanup', () => {
    it('closes button on unmount', async () => {
      const { unmount } = render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalled();
      });

      unmount();

      await waitFor(() => {
        expect(mockClose).toHaveBeenCalled();
      });
    });

    it('handles close errors gracefully', async () => {
      mockClose.mockRejectedValue(new Error('Close failed'));

      const { unmount } = render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalled();
      });

      // Should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('component re-initialization', () => {
    it('re-initializes when clientId changes', async () => {
      const { rerender } = render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(loadScript).toHaveBeenCalledTimes(1);
      });

      rerender(<PayPalButton {...mockProps} clientId="new-client-id" />);

      await waitFor(() => {
        expect(loadScript).toHaveBeenCalledTimes(2);
        expect(loadScript).toHaveBeenLastCalledWith(
          expect.objectContaining({
            clientId: 'new-client-id',
          }),
        );
      });
    });

    it('re-initializes when puppySlug changes', async () => {
      const { rerender } = render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(loadScript).toHaveBeenCalledTimes(1);
      });

      rerender(<PayPalButton {...mockProps} puppySlug="charlie" />);

      await waitFor(() => {
        expect(loadScript).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('initialization error handling', () => {
    it('handles loadScript throwing an error', async () => {
      vi.mocked(loadScript).mockRejectedValue(new Error('Script load failed'));

      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockProps.onError).toHaveBeenCalledWith('Script load failed');
        expect(mockProps.onProcessingChange).toHaveBeenCalledWith(false);
      });
    });

    it('handles non-Error exceptions during initialization', async () => {
      vi.mocked(loadScript).mockRejectedValue('Unknown failure');

      render(<PayPalButton {...mockProps} />);

      await waitFor(() => {
        expect(mockProps.onError).toHaveBeenCalledWith(
          'Failed to initialise PayPal. Please refresh and try again.',
        );
      });
    });
  });
});
