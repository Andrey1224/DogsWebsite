'use client';

import { useEffect, useRef } from 'react';
import type {
  PayPalButtonsComponent,
  PayPalButtonsComponentOptions,
  PayPalNamespace,
} from '@paypal/paypal-js';
import { loadScript } from '@paypal/paypal-js';

interface PayPalButtonProps {
  clientId: string | null;
  puppySlug: string;
  disabled?: boolean;
  buttonStyle?: PayPalButtonsComponentOptions['style'];
  onProcessingChange?: (isProcessing: boolean) => void;
  onError?: (message: string | null) => void;
  onSuccess?: (captureId?: string) => void;
}

export function PayPalButton({
  clientId,
  puppySlug,
  disabled = false,
  buttonStyle,
  onProcessingChange,
  onError,
  onSuccess,
}: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const paypalRef = useRef<PayPalNamespace | null>(null);
  const buttonRef = useRef<PayPalButtonsComponent | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializePayPal() {
      if (!clientId) {
        onError?.(
          'PayPal is not configured yet. Please contact support to enable this payment method.',
        );
        return;
      }

      try {
        const paypal = await loadScript({
          clientId,
          components: 'buttons',
          currency: 'USD',
          intent: 'capture',
          disableFunding: 'credit,card',
        });

        if (!paypal || !isMounted) {
          return;
        }

        if (typeof paypal.Buttons !== 'function') {
          onError?.(
            'PayPal SDK did not provide the Buttons component. Please refresh and try again.',
          );
          return;
        }

        paypalRef.current = paypal;

        if (!containerRef.current) {
          return;
        }

        const button = paypal.Buttons({
          style: {
            layout: 'horizontal',
            color: 'gold',
            shape: 'pill',
            label: 'paypal',
            height: 48,
            ...(buttonStyle ?? {}),
          },
          createOrder: async () => {
            onError?.(null);
            onProcessingChange?.(true);

            const response = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ puppySlug }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.orderId) {
              const message =
                typeof data.error === 'string'
                  ? data.error
                  : 'Unable to create PayPal order. Please try again.';
              onError?.(message);
              onProcessingChange?.(false);
              throw new Error(message);
            }

            return data.orderId as string;
          },
          onApprove: async (data) => {
            try {
              const response = await fetch('/api/paypal/capture', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orderId: data.orderID }),
              });

              const captureData = await response.json().catch(() => ({}));

              if (!response.ok || !captureData.success) {
                const message =
                  typeof captureData.error === 'string'
                    ? captureData.error
                    : 'Unable to capture PayPal order. Please contact support.';
                onError?.(message);
                throw new Error(message);
              }

              onSuccess?.(captureData.captureId as string | undefined);
            } catch (error) {
              const message =
                error instanceof Error ? error.message : 'Unexpected error capturing PayPal order.';
              onError?.(message);
              throw error;
            } finally {
              onProcessingChange?.(false);
            }
          },
          onCancel: () => {
            onProcessingChange?.(false);
            onError?.(null);
          },
          onError: (err) => {
            const message =
              err instanceof Error ? err.message : 'PayPal encountered an unexpected error.';
            onProcessingChange?.(false);
            onError?.(message);
          },
        } satisfies PayPalButtonsComponentOptions);

        if (!button.isEligible()) {
          onError?.('PayPal is unavailable in your region or browser.');
          return;
        }

        buttonRef.current = button;
        await button.render(containerRef.current);
        if (!isMounted) {
          await button.close();
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to initialise PayPal. Please refresh and try again.';
        onProcessingChange?.(false);
        onError?.(message);
      }
    }

    initializePayPal();

    return () => {
      isMounted = false;
      buttonRef.current?.close().catch(() => undefined);
      paypalRef.current = null;
      buttonRef.current = null;
    };
  }, [clientId, puppySlug, onError, onProcessingChange, onSuccess, buttonStyle]);

  return (
    <div className={`w-full ${disabled ? 'pointer-events-none opacity-60' : ''}`}>
      <div ref={containerRef} aria-live="polite" />
    </div>
  );
}
