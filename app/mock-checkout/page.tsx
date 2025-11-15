import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function MockCheckoutPage() {
  if (process.env.PLAYWRIGHT_MOCK_RESERVATION !== 'true') {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-accent-aux">
        Test Checkout
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-text">
        Mock checkout session for automated tests
      </h1>
      <p className="text-base text-muted">
        This page is only available when <code>PLAYWRIGHT_MOCK_RESERVATION</code> is enabled. The
        Playwright reservation scenario stops here instead of leaving the site or hitting Stripe.
      </p>
      <p className="rounded-3xl border border-border bg-card px-6 py-4 text-sm text-muted">
        If you reached this page outside of CI, set <code>PLAYWRIGHT_MOCK_RESERVATION=false</code>{' '}
        and restart the dev server to restore the usual checkout redirect.
      </p>
    </main>
  );
}
