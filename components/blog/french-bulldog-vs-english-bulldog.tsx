import Link from 'next/link';
import { ArrowRight, CheckCircle2, MessageCircle, PawPrint, ShieldCheck, Sofa } from 'lucide-react';
import { BulldogPersonalityQuiz } from './bulldog-personality-quiz';

const comparisonRows = [
  {
    label: 'Typical style',
    french: 'Expressive, curious, playful, and eager to join the activity',
    english: 'Affectionate, steady, easygoing, and happiest close to the family',
  },
  {
    label: 'Adult size',
    french: 'Smaller and easier to carry or fit into compact spaces',
    english: 'Heavier and more powerful, with a broad, solid build',
  },
  {
    label: 'Exercise',
    french: 'Short walks and play sessions, with room for lively bursts',
    english: 'Short, relaxed walks and gentle play at a comfortable pace',
  },
  {
    label: 'Communication',
    french: 'Famous for expressive faces, vocal reactions, and comic timing',
    english: 'Often quieter, but communicates volumes through looks and body language',
  },
  {
    label: 'Home fit',
    french: 'Often suits families wanting a compact, interactive companion',
    english: 'Often suits families wanting a calm, substantial companion',
  },
];

export function FrenchBulldogVsEnglishBulldog() {
  return (
    <article className="prose prose-invert max-w-none font-sans text-slate-300">
      <div className="space-y-6">
        <p className="text-xl font-medium leading-relaxed text-slate-200">
          So, you decided you need a bulldog. Excellent choice. The only real question is which
          bulldog feels most at home with your family: a French Bulldog or an English Bulldog?
        </p>
        <p className="leading-relaxed">
          We could begin with size, exercise, and all the responsible grown-up details. We will get
          to those. First, let&rsquo;s answer the more entertaining question: are you a French
          Bulldog person or an English Bulldog person?
        </p>
      </div>

      <BulldogPersonalityQuiz />

      <section className="mt-14 space-y-6">
        <h2 className="border-b border-slate-800 pb-3 text-2xl font-bold text-white md:text-3xl">
          Life With a French Bulldog
        </h2>
        <p className="leading-relaxed">
          A Frenchie does not simply live in your home. A Frenchie moves into your life. You go to
          the kitchen? Frenchie. You sit down to work? Frenchie. You move six feet to another chair?
          Congratulations&mdash;both of you have relocated.
        </p>
        <p className="leading-relaxed">
          French Bulldogs are often part clown, part child, and unquestionably best friend, with
          enough charisma for a dog three times their size. Young Frenchies can be little tornadoes.
          Many become calmer as they mature, but the comedy, curiosity, and expressive faces tend to
          remain. Sometimes one raised eyebrow is enough.
        </p>
        <div className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-6">
          <div className="flex items-start gap-4">
            <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
            <p className="m-0 text-sm leading-relaxed text-slate-200">
              A Frenchie can sound like a baby, an elderly gentleman filing a complaint, a squeaky
              door, or a tiny dinosaur. Spend enough time with one and eventually you will say,
              &ldquo;This dog is going to start talking.&rdquo;
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14 space-y-6">
        <h2 className="border-b border-slate-800 pb-3 text-2xl font-bold text-white md:text-3xl">
          Life With an English Bulldog
        </h2>
        <p className="leading-relaxed">
          An English Bulldog has a wonderful way of reminding you that not everything needs to be
          done at full speed. A walk can simply be a walk. You can enjoy the weather, stop for a
          minute, and sit outside afterward. Beside you is a broad, wrinkled, wonderfully solid
          companion who seems satisfied that you are both exactly where you should be.
        </p>
        <p className="leading-relaxed">
          Underneath all that muscle is an almost ridiculous amount of tenderness. English Bulldogs
          lean against you, rest that enormous head on your leg, and follow you from room to room
          while pretending it has absolutely nothing to do with you. Their presence can make the
          whole room feel calmer.
        </p>

        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
          <div className="flex items-start gap-4">
            <PawPrint className="mt-1 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <h3 className="mb-2 mt-0 text-base font-bold text-white">
                Then Someone Rolls the Ball
              </h3>
              <p className="m-0 text-sm leading-relaxed text-slate-200">
                The peaceful bear cub can suddenly become a bulldog-shaped projectile. Some English
                Bulldogs form a special relationship with one particular toy: they bring it to you
                to throw, refuse to release it, and begin negotiations. Once an agreement is
                reached, they chase it as though generations of family honor depend on the result.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14 space-y-6">
        <h2 className="border-b border-slate-800 pb-3 text-2xl font-bold text-white md:text-3xl">
          What Kind of Comedy Do You Prefer?
        </h2>
        <div className="not-prose grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-sky-400/20 bg-sky-400/5 p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-sky-300">
              French Bulldog
            </p>
            <p className="m-0 leading-relaxed text-slate-200">
              Someone who knows exactly how funny they are and keeps performing because you laughed
              once.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-300">
              English Bulldog
            </p>
            <p className="m-0 leading-relaxed text-slate-200">
              Someone who bumps into a chair, looks offended by the chair, and walks away as though
              nothing happened.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14 space-y-6">
        <h2 className="border-b border-slate-800 pb-3 text-2xl font-bold text-white md:text-3xl">
          French Bulldog vs. English Bulldog: Quick Comparison
        </h2>
        <p className="leading-relaxed">
          Personality matters, but so does daily life. These are broad tendencies rather than rules:
          individual temperament, age, health, socialization, and training can make a major
          difference.
        </p>

        <div className="not-prose overflow-hidden rounded-2xl border border-slate-800">
          <div className="hidden grid-cols-[0.8fr_1.1fr_1.1fr] gap-px bg-slate-800 md:grid">
            <div className="bg-[#111827] p-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Consideration
            </div>
            <div className="bg-[#111827] p-4 text-xs font-bold uppercase tracking-wider text-sky-300">
              French Bulldog
            </div>
            <div className="bg-[#111827] p-4 text-xs font-bold uppercase tracking-wider text-amber-300">
              English Bulldog
            </div>
          </div>
          {comparisonRows.map((row) => (
            <div
              key={row.label}
              className="grid gap-px border-t border-slate-800 bg-slate-800 first:border-t-0 md:grid-cols-[0.8fr_1.1fr_1.1fr]"
            >
              <div className="bg-[#151c2b] p-4 font-semibold text-white">{row.label}</div>
              <div className="bg-[#111827] p-4 text-sm leading-relaxed text-slate-300">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-sky-300 md:hidden">
                  French Bulldog
                </span>
                {row.french}
              </div>
              <div className="bg-[#111827] p-4 text-sm leading-relaxed text-slate-300">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-300 md:hidden">
                  English Bulldog
                </span>
                {row.english}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 space-y-6">
        <h2 className="border-b border-slate-800 pb-3 text-2xl font-bold text-white md:text-3xl">
          The Responsible Part Before You Choose
        </h2>
        <p className="leading-relaxed">
          Both are brachycephalic breeds, so neither is a match for long-distance running or
          extended activity in hot weather. Both need careful weight management, routine skin and
          wrinkle care, appropriate exercise, and access to veterinary care. English Bulldogs are
          generally larger and heavier; French Bulldogs are more compact, but compact does not mean
          low-maintenance.
        </p>

        <div className="not-prose grid gap-4 md:grid-cols-2">
          {[
            'Meet the breeder and ask about the temperament of both parents.',
            'Review breed-appropriate health testing and the puppy’s veterinary records.',
            'Be honest about your schedule, climate, activity level, and budget for lifelong care.',
            'Choose the individual puppy whose energy and confidence fit your household.',
          ].map((item) => (
            <div
              key={item}
              className="flex gap-3 rounded-xl border border-slate-800 bg-[#151c2b]/60 p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6b00]" aria-hidden="true" />
              <p className="m-0 text-sm leading-relaxed text-slate-200">{item}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border-l-4 border-[#ff6b00] bg-[#151c2b]/70 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-[#ff6b00]" aria-hidden="true" />
            <p className="m-0 text-sm leading-relaxed text-slate-200">
              Before making a decision, read our{' '}
              <Link
                href="/blog/choose-healthy-bulldog-puppy-health-tests"
                className="font-medium text-white underline transition-colors hover:text-[#ff6b00]"
              >
                guide to choosing a healthy Bulldog puppy
              </Link>{' '}
              and the{' '}
              <Link
                href="/blog/ultimate-guide-for-new-bulldog-owners"
                className="font-medium text-white underline transition-colors hover:text-[#ff6b00]"
              >
                essential new-owner guide
              </Link>
              . They cover the practical questions behind the personality match.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-14 space-y-6">
        <h2 className="border-b border-slate-800 pb-3 text-2xl font-bold text-white md:text-3xl">
          Which Bulldog Is Better for Your Family?
        </h2>
        <p className="leading-relaxed">
          Neither breed is simply better. The better question is: which personality feels more like
          home? If you want an expressive little shadow who joins every conversation, a French
          Bulldog may be your match. If you want a strong, gentle companion whose presence makes the
          room feel calmer, an English Bulldog may be the answer.
        </p>
        <p className="leading-relaxed">
          The Frenchie asks, &ldquo;What are we doing? I&rsquo;m coming too.&rdquo; The English
          Bulldog asks, &ldquo;Whatever we&rsquo;re doing, can we do it somewhere
          comfortable?&rdquo; One makes an ordinary Tuesday feel like a production. The other makes
          an ordinary Sunday morning feel like exactly enough.
        </p>
        <p className="leading-relaxed">
          And if both descriptions sound perfect, your biggest question may eventually be where to
          put the bigger sofa.
        </p>
      </section>

      <div className="not-prose my-12 overflow-hidden rounded-3xl border border-[#ff6b00]/25 bg-gradient-to-r from-[#1b2435] to-[#151c2b] p-7 md:p-9">
        <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff6b00]/10 text-[#ff6b00]">
              <Sofa className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="mb-2 text-xl font-bold text-white">Ready to Meet Your Match?</h2>
              <p className="m-0 max-w-xl text-sm leading-relaxed text-slate-300">
                Meet our available French and English Bulldog puppies, then contact us to talk about
                temperament, family fit, health records, and the next steps.
              </p>
            </div>
          </div>
          <Link
            href="/puppies"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#ff6b00] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#e66000]"
          >
            View available puppies
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <p className="mb-0 mt-5 text-sm text-slate-400">
          Have questions first? Read our{' '}
          <Link href="/faq" className="text-white underline hover:text-[#ff6b00]">
            puppy FAQ
          </Link>{' '}
          or{' '}
          <Link href="/contact" className="text-white underline hover:text-[#ff6b00]">
            contact Exotic Bulldog Legacy
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
