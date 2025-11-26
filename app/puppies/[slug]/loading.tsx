export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <div className="mx-auto max-w-5xl space-y-10 px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,1fr]">
          <div className="aspect-square animate-pulse rounded-3xl bg-slate-800/60" />
          <div className="space-y-4">
            <div className="h-6 w-1/3 animate-pulse rounded-full bg-slate-800/60" />
            <div className="h-10 w-1/2 animate-pulse rounded-full bg-slate-800/60" />
            <div className="h-24 animate-pulse rounded-3xl bg-slate-800/50" />
            <div className="h-36 animate-pulse rounded-3xl bg-slate-800/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
