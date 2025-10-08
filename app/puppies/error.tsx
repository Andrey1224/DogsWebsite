'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-text">
        Unable to load puppies right now
      </h1>
      <p className="text-sm text-muted">
        {error.message || 'Something went wrong while fetching the catalog.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-[color:var(--btn-bg)] px-5 py-2 text-sm font-semibold text-[color:var(--btn-text)] transition hover:brightness-105"
      >
        Try again
      </button>
    </div>
  );
}
