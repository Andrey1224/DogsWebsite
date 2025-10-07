export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr]">
        <div className="aspect-square animate-pulse rounded-3xl bg-neutral-200" />
        <div className="space-y-4">
          <div className="h-6 w-1/3 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-10 w-1/2 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-24 animate-pulse rounded-3xl bg-neutral-100" />
          <div className="h-36 animate-pulse rounded-3xl bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}
