/**
 * Reserve Button Component
 *
 * Client component that handles deposit reservations via Stripe Checkout
 * and PayPal Smart Buttons, providing customers with multiple secure
 * payment options.
 */

'use client';

import { useCallback, useState } from 'react';
import { PayPalButton } from '@/components/paypal-button';
import { createCheckoutSession } from './actions';

interface ReserveButtonProps {
  puppySlug: string;
  status: string;
  canReserve: boolean;
  reservationBlocked: boolean;
  depositAmount: number;
  paypalClientId: string | null;
}

export function ReserveButton({
  puppySlug,
  status,
  canReserve,
  reservationBlocked,
  depositAmount,
  paypalClientId,
}: ReserveButtonProps) {
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [isPayPalProcessing, setIsPayPalProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const depositLabel = depositAmount.toLocaleString('en-US', {
    minimumFractionDigits: depositAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: depositAmount % 1 === 0 ? 0 : 2,
  });

  const handleReserve = async () => {
    if (isPayPalProcessing) return;

    setIsStripeLoading(true);
    setError(null);

    try {
      const result = await createCheckoutSession(puppySlug);

      if (!result.success) {
        setError(result.error || 'Failed to create checkout session');
        setIsStripeLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (result.sessionUrl) {
        window.location.href = result.sessionUrl;
      } else {
        setError('No checkout URL received');
        setIsStripeLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsStripeLoading(false);
    }
  };

  const handlePayPalError = useCallback((message: string | null) => {
    setError(message);
  }, []);

  const handlePayPalSuccess = useCallback(() => {
    window.location.href = `/puppies/${puppySlug}/reserved?paypal=success`;
  }, [puppySlug]);

  if (!canReserve) {
    if (reservationBlocked) {
      return (
        <div className="space-y-3 rounded-3xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-accent">Reservation in progress</p>
          <p className="text-sm text-muted">
            Someone is currently completing a deposit for this puppy. Please check back in about 15 minutes
            or{" "}
            <a href="/contact" className="font-semibold text-accent hover:underline">
              contact us
            </a>{" "}
            if you&apos;d like to be notified when it becomes available again.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 rounded-3xl border border-border bg-card p-6">
        <p className="text-sm font-semibold text-muted">Status Update</p>
        <p className="text-sm text-muted">
          This puppy is currently <span className="font-semibold capitalize">{status}</span> and
          not available for reservation.
        </p>
        <p className="text-sm text-muted">
          Please check back later or{" "}
          <a href="/contact" className="font-semibold text-accent hover:underline">
            contact us
          </a>{" "}
          for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-3xl border border-accent/40 bg-[color:color-mix(in srgb, var(--accent) 18%, var(--bg))] p-6">
      <p className="text-sm font-semibold text-accent-aux">Ready to reserve?</p>
      <p className="text-sm text-accent-aux/80">
        Secure your puppy with a ${depositLabel} deposit. Choose Stripe or PayPal for secure payment processing.
      </p>

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleReserve}
        disabled={isStripeLoading || isPayPalProcessing}
        className="w-full rounded-full bg-[color:var(--btn-bg)] px-6 py-3 text-sm font-semibold text-[color:var(--btn-text)] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isStripeLoading ? 'Loading...' : `Reserve with $${depositLabel} Deposit (Stripe)`}
      </button>

      <p className="text-xs text-accent-aux/60">
        Powered by <span className="font-semibold">Stripe</span>
      </p>

      <div className="relative space-y-2 rounded-2xl border border-border/70 bg-card/80 p-4">
        <p className="text-xs uppercase tracking-[0.25em] text-accent-aux/70">OR PAY WITH</p>
        <PayPalButton
          clientId={paypalClientId}
          puppySlug={puppySlug}
          disabled={isStripeLoading || isPayPalProcessing}
          onProcessingChange={setIsPayPalProcessing}
          onError={handlePayPalError}
          onSuccess={handlePayPalSuccess}
        />
        <p className="text-xs text-accent-aux/60">Powered by PayPal</p>
      </div>
    </div>
  );
}
