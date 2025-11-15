/**
 * Reservation Success Page
 *
 * Displayed after successful Stripe Checkout Session.
 * Shows confirmation message and next steps.
 *
 * URL: /puppies/[slug]/reserved?session_id=cs_...
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPuppyBySlug } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Reservation Confirmed | Exotic Bulldog Legacy',
  description: 'Your puppy reservation has been confirmed. Thank you!',
};

interface ReservationSuccessPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ReservationSuccessPage({
  params,
  searchParams,
}: ReservationSuccessPageProps) {
  const { slug } = await params;
  const { session_id } = await searchParams;

  const puppy = await getPuppyBySlug(slug);

  if (!puppy) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-12">
      {/* Success Message */}
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-text">Reservation Confirmed!</h1>

        <p className="text-lg text-muted">
          Congratulations! Your reservation for{' '}
          <span className="font-semibold text-text">{puppy.name}</span> has been confirmed.
        </p>
      </div>

      {/* Confirmation Details */}
      <div className="rounded-3xl border border-border bg-card p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-muted">
            What&apos;s Next?
          </h2>
        </div>

        <ol className="space-y-4 text-sm">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
              1
            </span>
            <div>
              <p className="font-semibold text-text">Check your email for confirmation</p>
              <p className="text-muted">
                We&apos;ve sent a confirmation email with your reservation details and receipt.
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
              2
            </span>
            <div>
              <p className="font-semibold text-text">We&apos;ll reach out shortly</p>
              <p className="text-muted">
                Our team will contact you within 24 hours to discuss pickup details and answer any
                questions.
              </p>
            </div>
          </li>

          <li className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
              3
            </span>
            <div>
              <p className="font-semibold text-text">Prepare for your new puppy</p>
              <p className="text-muted">
                We&apos;ll provide you with care instructions, health records, and tips for bringing
                your puppy home.
              </p>
            </div>
          </li>
        </ol>

        {session_id && (
          <div className="mt-6 rounded-lg border border-border bg-bg p-4">
            <p className="text-xs text-muted">
              <span className="font-semibold">Session ID:</span>
              <br />
              <code className="text-xs">{session_id}</code>
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/puppies/${slug}`}
          className="rounded-full border border-border bg-card px-6 py-3 text-center text-sm font-semibold text-text transition-colors hover:bg-bg"
        >
          View {puppy.name}&apos;s Page
        </Link>
        <Link
          href="/puppies"
          className="rounded-full border border-border bg-card px-6 py-3 text-center text-sm font-semibold text-text transition-colors hover:bg-bg"
        >
          Browse More Puppies
        </Link>
        <Link
          href="/contact"
          className="rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Contact Us
        </Link>
      </div>

      {/* Additional Info */}
      <div className="rounded-3xl border border-accent/40 bg-[color:color-mix(in srgb, var(--accent) 18%, var(--bg))] p-6">
        <h3 className="text-sm font-semibold text-accent-aux">Need Help?</h3>
        <p className="mt-2 text-sm text-accent-aux/80">
          If you have any questions or concerns, please don&apos;t hesitate to{' '}
          <Link href="/contact" className="font-semibold underline">
            contact us
          </Link>
          . We&apos;re here to help!
        </p>
      </div>
    </div>
  );
}
