/**
 * Reserve Button Component
 *
 * Client component that handles deposit reservations via Stripe Checkout
 * and PayPal Smart Buttons, providing customers with multiple secure
 * payment options.
 */

'use client';

import { useCallback, useState } from 'react';
import { Lock } from 'lucide-react';

import { PayPalButton } from '@/components/paypal-button';
import { createCheckoutSession } from './actions';

interface ReserveButtonProps {
  puppySlug: string;
  puppyName?: string | null;
  status: string;
  canReserve: boolean;
  reservationBlocked: boolean;
  depositAmount: number;
  paypalClientId: string | null;
}

export function ReserveButton({
  puppySlug,
  puppyName,
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

  const reserveLabel = puppyName || puppySlug.split('-')[0] || 'Puppy';
  const paypalConfigured = Boolean(paypalClientId);

  if (!canReserve) {
    if (reservationBlocked) {
      return (
        <div className="space-y-3 rounded-2xl border border-slate-700/50 bg-[#1E293B] p-6">
          <p className="text-sm font-semibold text-orange-400">Reservation in progress</p>
          <p className="text-sm text-slate-400">
            Someone is currently completing a deposit for this puppy. Please check back in about 15
            minutes or{' '}
            <a href="/contact" className="font-semibold text-orange-400 hover:underline">
              contact us
            </a>{' '}
            if you&apos;d like to be notified when it becomes available again.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 rounded-2xl border border-slate-700/50 bg-[#1E293B] p-6">
        <p className="text-sm font-semibold text-slate-300">Status Update</p>
        <p className="text-sm text-slate-400">
          This puppy is currently <span className="font-semibold capitalize">{status}</span> and not
          available for reservation.
        </p>
        <p className="text-sm text-slate-400">
          Please check back later or{' '}
          <a href="/contact" className="font-semibold text-orange-400 hover:underline">
            contact us
          </a>{' '}
          for more information.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={handleReserve}
          disabled={isStripeLoading || isPayPalProcessing}
          className="mb-2 w-full rounded-2xl bg-[#F97316] py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] hover:bg-[#EA580C] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isStripeLoading ? 'Loading...' : `Reserve ${reserveLabel}`}
        </button>
        <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-slate-500">
          ${depositLabel} deposit • Powered by
          <Lock size={10} />
          <span className="font-semibold">Stripe</span>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-800 bg-[#151e32] p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Or pay with
        </p>
        {paypalConfigured ? (
          <PayPalButton
            clientId={paypalClientId}
            puppySlug={puppySlug}
            disabled={isStripeLoading || isPayPalProcessing}
            buttonStyle={{
              layout: 'horizontal',
              color: 'gold',
              shape: 'pill',
              label: 'paypal',
              height: 48,
            }}
            onProcessingChange={setIsPayPalProcessing}
            onError={handlePayPalError}
            onSuccess={handlePayPalSuccess}
          />
        ) : (
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-1 rounded-xl bg-[#FFC439] py-3 text-lg font-bold text-[#003087] shadow-sm"
          >
            <span className="italic font-bold">Pay</span>
            <span className="italic font-bold text-[#009cde]">Pal</span>
          </button>
        )}
        <p className="text-center text-[10px] text-slate-500">The safer, easier way to pay</p>
      </div>
    </div>
  );
}
