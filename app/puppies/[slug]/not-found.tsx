import Link from "next/link";

export default function PuppyNotFound() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        We couldn’t find that puppy
      </h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-300">
        It may have just been reserved or the link could be outdated. Browse the current catalog to
        see who is still available.
      </p>
      <Link
        href="/puppies"
        className="inline-flex rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        Back to catalog
      </Link>
    </div>
  );
}
