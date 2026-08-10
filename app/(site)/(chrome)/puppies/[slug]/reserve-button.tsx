/**
 * Reserve Button Component
 *
 * Client component with the primary "Apply" / "Schedule a Video Call" CTAs
 * that start the human-approval process, plus a demoted deposit step
 * (Stripe Checkout / PayPal Smart Buttons) for buyers who have already been
 * confirmed and signed a contract.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

import { useAnalytics } from '@/components/analytics-provider';
import { createCheckoutSession } from './actions';

interface ReserveButtonProps {
  puppySlug: string;
  puppyName?: string | null;
  status: string;
  canReserve: boolean;
  reservationBlocked: boolean;
  reservationsDisabled: boolean;
  reservationsDisabledMessage?: string | null;
  depositAmount: number;
  paypalClientId: string | null;
}

export function ReserveButton({
  puppySlug,
  puppyName,
  status,
  canReserve,
  reservationBlocked,
  reservationsDisabled,
  reservationsDisabledMessage,
  depositAmount,
  paypalClientId,
}: ReserveButtonProps) {
  const { getAnalyticsIdentifiers, trackEvent } = useAnalytics();
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const isPayPalProcessing = false;
  const [error, setError] = useState<string | null>(null);
  const depositLabel = depositAmount.toLocaleString('en-US', {
    minimumFractionDigits: depositAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: depositAmount % 1 === 0 ? 0 : 2,
  });

  const handleCheckout = async () => {
    if (isPayPalProcessing || isDepositLoading) return;

    setIsDepositLoading(true);
    setError(null);

    const commerceParams = {
      currency: 'USD',
      value: depositAmount,
      items: [
        {
          item_id: puppySlug,
          item_name: puppyName || puppySlug,
          item_category: 'Puppy deposit',
          price: depositAmount,
          quantity: 1,
        },
      ],
    };

    trackEvent('reserve_click', {
      puppy_slug: puppySlug,
      puppy_name: puppyName ?? undefined,
      deposit_amount: depositAmount,
      payment_provider: 'stripe',
      payment_type: 'deposit',
    });
    trackEvent('begin_checkout', commerceParams);

    try {
      const analyticsIdentifiers = await getAnalyticsIdentifiers();
      const result = await createCheckoutSession(puppySlug, 'deposit', analyticsIdentifiers);

      if (!result.success) {
        trackEvent('checkout_error', {
          puppy_slug: puppySlug,
          payment_provider: 'stripe',
          payment_type: 'deposit',
          error_code: result.errorCode,
        });
        setError(result.error || 'Failed to create checkout session');
        setIsDepositLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (result.sessionUrl) {
        window.location.href = result.sessionUrl;
      } else {
        trackEvent('checkout_error', {
          puppy_slug: puppySlug,
          payment_provider: 'stripe',
          payment_type: 'deposit',
          error_code: 'MISSING_CHECKOUT_URL',
        });
        setError('No checkout URL received');
        setIsDepositLoading(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      trackEvent('checkout_error', {
        puppy_slug: puppySlug,
        payment_provider: 'stripe',
        payment_type: 'deposit',
        error_code: 'UNEXPECTED_ERROR',
      });
      setError(errorMessage);
      setIsDepositLoading(false);
    }
  };

  const reserveLabel = puppyName || puppySlug.split('-')[0] || 'Puppy';
  const paypalConfigured = Boolean(paypalClientId);
  const applyHref = `/contact?puppy=${encodeURIComponent(puppySlug)}`;

  const primaryCtas = (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href={applyHref}
        className="flex-1 rounded-2xl bg-[#F97316] py-4 text-center text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] hover:bg-[#EA580C] active:scale-[0.99]"
      >
        Apply for {reserveLabel}
      </Link>
      <Link
        href={applyHref}
        className="flex-1 rounded-2xl border-2 border-slate-700 py-4 text-center text-lg font-bold text-white transition-all hover:scale-[1.01] hover:border-slate-500 active:scale-[0.99]"
      >
        Schedule a Video Call
      </Link>
    </div>
  );

  if (status === 'sold') {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-700/50 bg-[#1E293B] p-6">
        <p className="text-sm font-semibold text-slate-300">Unavailable</p>
        <p className="text-sm text-slate-400">
          This puppy has found a home and is no longer available for reservation.
        </p>
        <p className="text-sm text-slate-400">
          View our other listings or{' '}
          <a href="/contact" className="font-semibold text-orange-400 hover:underline">
            contact us
          </a>{' '}
          about upcoming litters.
        </p>
      </div>
    );
  }

  if (reservationsDisabled) {
    return (
      <div className="space-y-5">
        {primaryCtas}
        <div className="space-y-3 rounded-2xl border border-slate-700/50 bg-[#1E293B] p-6">
          <p className="text-sm font-semibold text-orange-400">
            Deposit payments temporarily paused
          </p>
          <p className="text-sm text-slate-400">
            {reservationsDisabledMessage ??
              "We're finalizing Stripe customer setup. Please check back soon or reach out if you need help."}
          </p>
          <p className="text-xs text-slate-500">
            Applications and video call requests above are still open.
          </p>
        </div>
      </div>
    );
  }

  if (!canReserve) {
    if (reservationBlocked) {
      return (
        <div className="space-y-5">
          {primaryCtas}
          <div className="space-y-3 rounded-2xl border border-slate-700/50 bg-[#1E293B] p-6">
            <p className="text-sm font-semibold text-orange-400">Reservation in progress</p>
            <p className="text-sm text-slate-400">
              Someone is currently completing a deposit for this puppy. Please check back in about
              15 minutes or{' '}
              <a href="/contact" className="font-semibold text-orange-400 hover:underline">
                contact us
              </a>{' '}
              if you&apos;d like to be notified when it becomes available again.
            </p>
          </div>
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
      {primaryCtas}

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-[#151e32] p-5">
        <p className="mb-4 text-sm text-slate-400">
          Already approved? A ${depositLabel} deposit secures {reserveLabel} once we&apos;ve
          confirmed your application and you&apos;ve signed the contract.
        </p>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={isDepositLoading || isPayPalProcessing}
          className="mb-2 w-full rounded-2xl border-2 border-[#F97316] bg-transparent py-3 text-base font-bold text-[#F97316] transition-all hover:scale-[1.01] hover:bg-[#F97316]/10 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDepositLoading ? 'Loading...' : `Pay $${depositLabel} deposit`}
        </button>
        <div className="mb-4 flex items-center justify-center gap-1 text-[10px] font-medium text-slate-500">
          Final step after approval • Powered by
          <Lock size={8} />
          <span className="font-semibold">Stripe</span>
        </div>

        <div className="mb-3 ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Or pay with
        </div>
        {paypalConfigured ? (
          <div className="space-y-2 rounded-xl border border-slate-700/60 bg-slate-900/40 p-3 text-center text-sm text-slate-400">
            <div className="font-semibold text-slate-200">PayPal temporarily disabled</div>
            <div>We&apos;re finalizing PayPal testing. Please use Stripe for now.</div>
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-center gap-1 rounded-xl bg-[#FFC439]/60 py-3 text-lg font-bold text-[#003087]/70 opacity-70"
            >
              <span className="italic font-bold">Pay</span>
              <span className="italic font-bold text-[#009cde]">Pal</span>
            </button>
          </div>
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
        <div className="mt-2 text-center text-[10px] text-slate-500">
          The safer, easier way to pay
        </div>
      </div>
    </div>
  );
}
