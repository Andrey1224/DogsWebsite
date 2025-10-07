export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
      <section className="max-w-2xl text-center sm:text-left">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
          Exotic Bulldog Level
        </p>
        <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
          Coming soon: a trusted home for French & English bulldog matches
        </h1>
        <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-300">
          We are preparing a catalog-led experience with transparent health
          records, quick contact options, and secure deposits so families can
          reserve their perfect companion with confidence.
        </p>
      </section>

      <section className="grid gap-6 text-sm sm:grid-cols-3 sm:text-left">
        {[
          {
            title: "Puppy catalog",
            description:
              "Filter by breed, color, availability, and meet each puppy’s parents before booking.",
          },
          {
            title: "Seamless outreach",
            description:
              "Tap-to-call, WhatsApp, Telegram, SMS, and chat powered by Crisp keep conversations moving.",
          },
          {
            title: "Safe reservations",
            description:
              "Stripe and PayPal deposits lock in your pick while Supabase keeps orders and media secure.",
          },
        ].map((feature) => (
          <article
            key={feature.title}
            className="rounded-xl border border-neutral-200 bg-white/60 p-6 text-left shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/60"
          >
            <h2 className="text-lg font-semibold">{feature.title}</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300">
              {feature.description}
            </p>
          </article>
        ))}
      </section>

      <footer className="text-center text-sm text-neutral-500 dark:text-neutral-400">
        Sprint 0 is focused on infrastructure and developer experience. Follow
        the guide in <code>AGENTS.md</code> to get set up locally.
      </footer>
    </main>
  );
}
