export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-12">
      <div className="h-8 w-2/3 animate-pulse rounded-full bg-[color:color-mix(in srgb, var(--text) 12%, var(--bg))]" />
      <div className="h-4 w-1/2 animate-pulse rounded-full bg-[color:color-mix(in srgb, var(--text) 12%, var(--bg))]" />
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-3xl border border-border bg-[color:color-mix(in srgb, var(--text) 8%, var(--bg))]"
          />
        ))}
      </div>
    </div>
  );
}
