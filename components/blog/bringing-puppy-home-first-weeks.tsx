import Link from 'next/link';
import { ArrowRight, ArrowDown, CheckCircle2, RefreshCw } from 'lucide-react';

export function BringingPuppyHomeFirstWeeks() {
  const firstWeeksCycle = [
    { title: 'WAKE UP', color: 'border-sky-900/30 bg-sky-950/10 text-sky-400' },
    { title: 'POTTY', color: 'border-emerald-900/30 bg-emerald-950/10 text-emerald-400' },
    { title: 'MEAL', color: 'border-orange-900/30 bg-orange-950/10 text-orange-400' },
    {
      title: 'PLAY / 3–5 MIN TRAINING',
      color: 'border-purple-900/30 bg-purple-950/10 text-purple-400',
    },
    { title: 'POTTY', color: 'border-emerald-900/30 bg-emerald-950/10 text-emerald-400' },
    { title: 'NAP', color: 'border-sky-900/30 bg-sky-950/10 text-sky-400' },
  ];

  const calmBehaviorFlow = [
    { title: 'CALM BEHAVIOR', color: 'border-sky-900/30 bg-sky-950/10 text-sky-400' },
    {
      title: 'ACCESS TO SOMETHING VALUABLE',
      color: 'border-emerald-900/30 bg-emerald-950/10 text-emerald-400',
    },
    {
      title: 'PUPPY REPEATS CALM BEHAVIOR',
      color: 'border-purple-900/30 bg-purple-950/10 text-purple-400',
    },
  ];

  const checklist = [
    {
      title: 'Safe Zone',
      desc: 'Create one quiet puppy-proofed resting area.',
    },
    {
      title: 'Routine',
      desc: 'Keep meals, potty trips, play, and naps predictable.',
    },
    {
      title: 'Potty Timing',
      desc: 'Prevent accidents instead of waiting to correct them.',
    },
    {
      title: 'House Rules',
      desc: 'Agree on boundaries before bad habits appear.',
    },
    {
      title: 'Name Recognition',
      desc: 'Build immediate attention to their name.',
    },
    {
      title: 'Impulse Control',
      desc: 'Practice calm behavior around meals and doors.',
    },
    {
      title: 'Appropriate Chewing',
      desc: 'Redirect puppy biting toward safe toys.',
    },
    {
      title: 'Trust',
      desc: 'Trade instead of forcibly taking valuable items.',
    },
  ];

  return (
    <article className="prose prose-invert max-w-none font-sans text-slate-300">
      <div className="space-y-6">
        <p className="text-xl font-medium leading-relaxed text-slate-200">
          Bringing a puppy home is one of the most exciting moments for any family. But those first
          days are about much more than cuddles, toys, and choosing a name.
        </p>
        <p className="leading-relaxed">
          <strong className="text-white">
            The first 3–4 weeks begin shaping the habits your puppy may carry for life.
          </strong>
        </p>
        <p className="leading-relaxed">
          This is especially important with confident, strong-willed breeds such as French Bulldogs,
          English Bulldogs, and other molosser-type dogs. They are intelligent, observant, full of
          personality — and very quick to learn what works.
        </p>
        <p className="leading-relaxed">
          From day one, your goal is not to dominate your puppy or overwhelm them with rules. It is
          to create something much more valuable:
        </p>
        <p className="leading-relaxed font-bold text-white">
          Safety. Predictability. Calm leadership. Consistency.
        </p>
        <p className="leading-relaxed">
          When those foundations are clear, training becomes easier for both the puppy and the
          family.
        </p>

        <div className="my-8 rounded-2xl border border-sky-900/30 bg-sky-950/10 p-6 md:p-8">
          <h4 className="mb-2 text-base font-bold uppercase tracking-wider text-sky-400">
            Our Training Philosophy
          </h4>
          <p className="text-sm italic leading-relaxed text-slate-300">
            At Exotic Bulldog Legacy, we believe a puppy learns best when the rules are clear, the
            routine is predictable, and the relationship is built on trust rather than fear.
          </p>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          1. Start With a Safe Zone and a Predictable Routine
        </h2>
        <p className="leading-relaxed">
          A new puppy does not need access to the entire house on the first day. Too much freedom
          too quickly can create confusion, accidents, destructive chewing, and unnecessary stress.
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">Create a Safe Zone</h3>
        <p className="leading-relaxed">
          Set up an exercise pen, crate, or dedicated puppy-proofed area. It should include a
          comfortable resting space, fresh water, appropriate chew toys, and — if you are using
          indoor potty training — a designated puppy-pad area.
        </p>
        <p className="leading-relaxed">The purpose is not punishment or isolation.</p>
        <p className="leading-relaxed">
          <strong className="text-white">
            The safe zone gives your puppy a place where nothing complicated is expected of them.
          </strong>
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">The Golden Rule of Rest</h3>
        <p className="leading-relaxed">
          When the puppy is sleeping or resting in their safe area, leave them alone. This rule is
          especially important in homes with children.
        </p>
        <p className="leading-relaxed">
          A puppy needs to learn:{' '}
          <strong className="text-white">
            &quot;This is my safe place. Nobody bothers me here.&quot;
          </strong>{' '}
          Make sure to review our{' '}
          <Link
            href="/blog/ultimate-guide-for-new-bulldog-owners"
            className="text-[#ff6b00] hover:underline"
          >
            Ultimate Guide for New Bulldog Owners
          </Link>{' '}
          to help prepare your home for their arrival.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Build a Daily Rhythm
        </h2>
        <p className="leading-relaxed">
          Dogs thrive on patterns. During the first few weeks, life does not need to be complicated.
          A simple repeating routine gives the puppy confidence because they begin to understand
          what happens next.
        </p>

        <div className="my-10 space-y-4">
          <h4 className="mb-6 text-center text-sm font-bold uppercase tracking-wider text-slate-400">
            First Weeks Puppy Cycle
          </h4>
          <div className="hidden items-center justify-between gap-2 lg:flex">
            {firstWeeksCycle.map((step, idx) => (
              <div key={idx} className="flex flex-1 items-center">
                <div
                  className={`flex w-full items-center justify-center rounded-xl border p-4 text-center ${step.color}`}
                >
                  <span className="text-xs font-bold">{step.title}</span>
                </div>
                {idx < firstWeeksCycle.length - 1 ? (
                  <ArrowRight className="mx-1 h-5 w-5 shrink-0 text-slate-600" />
                ) : (
                  <RefreshCw className="ml-2 h-5 w-5 shrink-0 text-sky-400" />
                )}
              </div>
            ))}
          </div>

          <div className="mx-auto flex max-w-sm flex-col items-center space-y-2 lg:hidden">
            {firstWeeksCycle.map((step, idx) => (
              <div key={idx} className="flex w-full flex-col items-center">
                <div className={`w-full rounded-xl border p-4 text-center ${step.color}`}>
                  <span className="text-sm font-bold">{step.title}</span>
                </div>
                {idx < firstWeeksCycle.length - 1 ? (
                  <ArrowDown className="my-2 h-5 w-5 text-slate-600" />
                ) : (
                  <RefreshCw className="mt-4 h-6 w-6 text-sky-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="leading-relaxed">
          Young puppies sleep a great deal. Do not make the mistake of trying to entertain them
          every waking minute. Short periods of activity followed by proper rest are much more
          productive than keeping an overtired puppy constantly stimulated.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          2. Establish Potty Habits From the Beginning
        </h2>
        <p className="leading-relaxed">
          Potty training should start immediately, but the method depends on your home, schedule,
          vaccination situation, and long-term goals.
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">Timing Matters More Than Anything</h3>
        <p className="leading-relaxed">
          Take your puppy to the potty area{' '}
          <strong className="text-white">immediately after waking</strong>, shortly after meals or
          drinking, after active play, and before settling down for another nap or bedtime. Do not
          wait for an accident and then react. The easiest potty accident to fix is the one you
          prevented.
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">Reward the Exact Moment of Success</h3>
        <p className="leading-relaxed">
          The moment your puppy finishes in the correct place, praise them and offer a valuable
          reward. Timing is critical. The puppy must connect:{' '}
          <strong className="text-white">
            &quot;I did this here → something good happened.&quot;
          </strong>
        </p>

        <div className="my-8 rounded-2xl border border-slate-800 bg-[#151c2b] p-6 md:p-8">
          <h4 className="mb-2 text-base font-bold text-white">
            Want the complete potty-training system?
          </h4>
          <p className="mb-4 text-sm leading-relaxed text-slate-300">
            Read our dedicated guide for timing, pads, outdoor transition, age-based expectations,
            and troubleshooting.
          </p>
          <Link
            href="/blog/puppy-potty-training-101"
            className="inline-flex items-center gap-2 rounded-xl border border-[#ff6b00]/30 bg-[#ff6b00]/10 px-4 py-2 text-sm font-bold text-[#ff6b00] transition-colors hover:bg-[#ff6b00]/20"
          >
            Read Puppy Potty Training 101 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          3. Calm Leadership: Clear Rules Without Force
        </h2>
        <p className="leading-relaxed">
          Bulldogs can be incredibly affectionate, funny, and people-oriented. They can also be
          remarkably determined. Trying to overpower a strong-willed puppy usually creates
          unnecessary conflict.
        </p>
        <p className="leading-relaxed">
          Instead, teach your puppy that{' '}
          <strong className="text-white">
            calm behavior opens doors to everything they value.
          </strong>
        </p>

        <div className="my-10 space-y-4">
          <div className="hidden items-center justify-center gap-4 md:flex">
            {calmBehaviorFlow.map((step, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`rounded-xl border p-5 text-center ${step.color}`}>
                  <span className="text-sm font-bold">{step.title}</span>
                </div>
                {idx < calmBehaviorFlow.length - 1 && (
                  <ArrowRight className="mx-4 h-6 w-6 text-slate-600" />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 md:hidden">
            {calmBehaviorFlow.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-64 rounded-xl border p-5 text-center ${step.color}`}>
                  <span className="text-sm font-bold">{step.title}</span>
                </div>
                {idx < calmBehaviorFlow.length - 1 && (
                  <ArrowDown className="my-2 h-6 w-6 text-slate-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        <h3 className="mt-8 text-xl font-bold text-white">Nothing in Life Is Free</h3>
        <p className="leading-relaxed">
          Meals, toys, opening doors, play, and affection can become small training opportunities.
          Before receiving something exciting, ask for one simple calm behavior.
        </p>
        <ul className="list-disc pl-6 text-slate-300">
          <li>
            <strong>Food bowl:</strong> sit or stand calmly first.
          </li>
          <li>
            <strong>Going outside:</strong> wait instead of scratching or launching through the
            doorway.
          </li>
          <li>
            <strong>Toy:</strong> offer brief eye contact before the game begins.
          </li>
        </ul>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          4. Surviving the “Land Shark” Phase
        </h2>
        <p className="leading-relaxed">
          Almost every puppy goes through a stage where everything seems to belong in their mouth.
          Hands. Sleeves. Shoes. Ankles. Furniture.
        </p>
        <p className="leading-relaxed">
          Avoid wrestling with the puppy using your bare hands or feet. If teeth touch skin, stop
          the interaction briefly. Freeze, disengage for several seconds, and then redirect the
          puppy toward an appropriate chew or toy.
        </p>
        <p className="leading-relaxed">
          The lesson is simple:{' '}
          <strong className="text-white">
            Skin makes the game stop. Toys make the game continue.
          </strong>
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          5. The First Three Skills Every Puppy Should Learn
        </h2>

        <h3 className="mt-8 text-xl font-bold text-white">
          Skill #1: Name Recognition and Eye Contact
        </h3>
        <p className="leading-relaxed">
          Your puppy&apos;s name should mean:{' '}
          <strong className="text-white">
            &ldquo;Look at me — something useful is about to happen.&rdquo;
          </strong>
          Say the name once. The moment they look toward you:{' '}
          <strong>Mark → &ldquo;Yes!&rdquo; → Reward</strong>.
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">
          Skill #2: Impulse Control at the Food Bowl
        </h3>
        <p className="leading-relaxed">
          Hold the bowl. If the puppy jumps wildly toward it, simply move it back up. As soon as the
          puppy becomes calm, begin lowering the bowl again. The puppy learns:{' '}
          <strong className="text-white">Self-control gets me what I want faster.</strong>
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">Skill #3: The Beginning of “Leave It”</h3>
        <p className="leading-relaxed">
          Place a treat inside your closed fist. Do nothing while they sniff or paw. The moment they
          stop trying and move away:
          <strong>“Yes!” → reward from your other hand.</strong> They discover that backing away
          from what they want unlocks something better.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Your First-Weeks Checklist
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {checklist.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-xl border border-slate-800 bg-[#151c2b] p-5 transition-colors hover:border-slate-700"
            >
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h5 className="font-bold text-white">{item.title}</h5>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 border-t border-slate-800 pt-8">
        <h4 className="mb-4 text-lg font-bold text-white">Final Thoughts</h4>
        <p className="leading-relaxed">
          A puppy does not need a perfect owner. They need a <strong>predictable one</strong>. Stay
          calm. Stay consistent. Keep the rules simple. The work you put into those first weeks
          becomes the foundation for the dog who will live beside you for years.
        </p>

        <div className="mt-8 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/puppies"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>View Available Puppies</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/blog/ultimate-guide-for-new-bulldog-owners"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>Bulldog Owner Guide</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/locations"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>Pickup & Delivery Areas</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>Questions? Contact Us</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
