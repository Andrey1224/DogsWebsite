'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        Unable to load puppies right now
      </h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        {error.message || 'Something went wrong while fetching the catalog.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        Try again
      </button>
    </div>
  );
}
