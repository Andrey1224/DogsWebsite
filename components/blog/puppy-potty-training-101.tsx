'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowDown,
  Lightbulb,
  ShieldAlert,
  Eye,
  MessageCircle,
  Bell,
} from 'lucide-react';

export function PuppyPottyTraining101() {
  const padsPros = [
    'Convenient at night: no need to run outside every 2–3 hours',
    'Safety: protected from outdoor infections before vaccinations finish',
    'Weatherproof: rain, cold, or storms won’t get in the way',
  ];
  const padsCons = [
    'Confusion with soft surfaces like rugs, blankets, or the couch',
    'Smell and cleanup: constantly replacing used pads',
    'Harder to transition later if used too long',
  ];
  const outdoorPros = [
    'Clean home: no smells or supplies needed indoors',
    'Establishes a routine with a regular walking schedule',
    'Proper habits: separates living space from bathroom space',
  ];
  const outdoorCons = ['Requires strict timing and physical effort in any weather, day or night'];

  const landingStrip = [
    {
      title: 'Cover the Area',
      desc: 'Place 3–4 pads next to each other to cover their favorite spot',
      color: 'border-sky-900/30 bg-sky-950/10 text-sky-400',
    },
    {
      title: 'Consistent Hits',
      desc: 'Puppy consistently uses the larger, covered target area',
      color: 'border-sky-950 bg-sky-950/20 text-sky-300',
    },
    {
      title: 'Shrink Gradually',
      desc: 'Remove one pad every 2–3 days as accuracy improves',
      color: 'border-cyan-900/30 bg-cyan-950/10 text-cyan-400',
    },
    {
      title: 'One Pad Remains',
      desc: 'The puppy now reliably targets a single, specific spot',
      color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200 font-semibold',
    },
  ];

  const ageMilestones = [
    { age: '2 months', hold: '1–2 hours max' },
    { age: '3 months', hold: '~3 hours' },
    { age: '4–5 months', hold: 'Up to 4–5 hours' },
    { age: '6–8 months', hold: 'Adult schedule (8–10 hrs overnight)' },
  ];

  const cueMethods = [
    {
      icon: Eye,
      title: 'Watch Their Signals',
      desc: 'Pacing, circling, whining, or sniffing the floor intensely means it’s time to go outside immediately.',
    },
    {
      icon: MessageCircle,
      title: 'Use a Cue Word',
      desc: 'Repeat a command like "Go potty" every time, then give enthusiastic praise and a treat when they finish.',
    },
    {
      icon: Bell,
      title: 'The Bell Method',
      desc: 'Hang a bell on the door handle and nudge it with the puppy’s paw every time you go outside.',
    },
  ];

  return (
    <article className="prose prose-invert max-w-none font-sans text-slate-300">
      {/* Intro section */}
      <div className="space-y-6">
        <p className="text-xl font-medium leading-relaxed text-slate-200">
          Potty training is one of the first and most important steps in helping a new puppy adjust
          to your home.
        </p>
        <p className="leading-relaxed">
          This process requires patience, consistency, and a clear understanding of puppy
          physiology. Let&rsquo;s look at the two main methods, their pros and cons, and how to
          build a routine without stress.
        </p>
      </div>

      {/* Option 1: Indoor Puppy Pads */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Option 1: Indoor Puppy Pads
        </h2>
        <p className="leading-relaxed">
          Puppy pads are a great temporary tool, especially during the post-vaccination quarantine
          period or for very young puppies.
        </p>

        <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-5">
            <h5 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-400">
              Pros
            </h5>
            <div className="space-y-3">
              {padsPros.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-red-900/30 bg-red-950/10 p-5">
            <h5 className="mb-3 text-sm font-bold uppercase tracking-wider text-red-400">Cons</h5>
            <div className="space-y-3">
              {padsCons.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Option 2: Outdoor Training */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Option 2: Outdoor Training
        </h2>
        <p className="leading-relaxed">This is the natural and ideal option for any adult dog.</p>

        <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-5">
            <h5 className="mb-3 text-sm font-bold uppercase tracking-wider text-emerald-400">
              Pros
            </h5>
            <div className="space-y-3">
              {outdoorPros.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-red-900/30 bg-red-950/10 p-5">
            <h5 className="mb-3 text-sm font-bold uppercase tracking-wider text-red-400">Cons</h5>
            <div className="space-y-3">
              {outdoorCons.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <span className="text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Landing Strip Method */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          How to Get Your Puppy to Use One Specific Spot
        </h2>
        <p className="leading-relaxed">
          A common problem: the puppy understands what the pad is for, but sometimes uses it,
          sometimes misses, or picks a completely different corner. This happens because they
          haven&rsquo;t formed a clear mental and physical connection to that specific spot yet.
        </p>
        <p className="leading-relaxed">
          <strong className="text-white">Limit their space at first:</strong> During the first few
          weeks, use a playpen or keep the puppy in a single room. The smaller the area, the easier
          it is for them to remember the spot without getting confused.
        </p>

        {/* Landing Strip Flow Diagram */}
        <div className="my-10 space-y-4">
          <h4 className="mb-6 text-center text-sm font-bold uppercase tracking-wider text-sky-400">
            The &ldquo;Landing Strip&rdquo; Method
          </h4>

          {/* Desktop flow (horizontal cards) */}
          <div className="hidden items-stretch justify-between gap-2 lg:flex">
            {landingStrip.map((step, idx) => (
              <div key={idx} className="flex w-full items-center">
                <div
                  className={`flex h-full flex-1 flex-col justify-between rounded-xl border p-4 text-center ${step.color}`}
                >
                  <span className="mb-1 text-xs font-bold text-slate-500">STEP 0{idx + 1}</span>
                  <h5 className="mb-2 text-sm font-bold leading-tight text-white">{step.title}</h5>
                  <p className="text-[11px] leading-normal text-slate-400">{step.desc}</p>
                </div>
                {idx < landingStrip.length - 1 && (
                  <ArrowRight className="mx-1 h-5 w-5 shrink-0 text-sky-900/50" />
                )}
              </div>
            ))}
          </div>

          {/* Mobile flow (vertical stack) */}
          <div className="mx-auto flex max-w-md flex-col items-center space-y-2 lg:hidden">
            {landingStrip.map((step, idx) => (
              <div key={idx} className="flex w-full flex-col items-center">
                <div className={`w-full rounded-xl border p-5 text-center ${step.color}`}>
                  <span className="mb-1 block text-xs font-bold text-slate-500">
                    STEP 0{idx + 1}
                  </span>
                  <h5 className="mb-2 text-base font-bold leading-tight text-white">
                    {step.title}
                  </h5>
                  <p className="text-xs leading-normal text-slate-400">{step.desc}</p>
                </div>
                {idx < landingStrip.length - 1 && (
                  <ArrowDown className="my-2 h-5 w-5 text-sky-900/50" />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="leading-relaxed">
          <strong className="text-white">Block off &ldquo;wrong&rdquo; spots:</strong> Clean any
          accident spots with a special enzymatic spray that completely destroys the odor (standard
          bleach or ammonia products will actually attract the puppy back to that spot). Put heavy
          objects or food and water bowls in their favorite &ldquo;wrong&rdquo; corners &mdash; dogs
          instinctively avoid going to the bathroom where they eat.
        </p>
        <p className="leading-relaxed">
          <strong className="text-white">Keep the scent:</strong> When replacing a pad, place a
          small piece of the old, used pad on top of the clean one as a scent marker.
        </p>
        <p className="leading-relaxed">
          <strong className="text-white">Watch key moments:</strong> Puppies usually need to go
          right after waking up, 5&ndash;15 minutes after eating or drinking, and after active play.
          Don&rsquo;t wait for them to look for a spot &mdash; take them straight to the pad.
        </p>
        <p className="leading-relaxed">
          <strong className="text-white">Time your praise correctly:</strong> Praise them and give a
          treat while they are going or within 2 seconds after they finish. If you wait until they
          walk away, they won&rsquo;t understand what the reward was for.
        </p>
      </div>

      {/* Age Milestones */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          How and When Puppies Learn to Hold It
        </h2>
        <p className="leading-relaxed">
          Physiologically, puppies don&rsquo;t gain full control over their bladder and bowels until
          around 3.5 to 4 months old. Before this age, they simply can&rsquo;t hold it for long.
        </p>

        <div className="my-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {ageMilestones.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800/80 bg-[#151c2b]/30 p-4 text-center"
            >
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#ff6b00]">
                {item.age}
              </span>
              <span className="text-sm font-medium text-slate-200">{item.hold}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Teaching Cues */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          How to Teach a Puppy to Ask to Go Outside
        </h2>
        <p className="leading-relaxed">
          To help your puppy let you know when it&rsquo;s time to go out, use clear cues:
        </p>

        <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {cueMethods.map((method, idx) => {
            const Icon = method.icon;
            return (
              <div key={idx} className="rounded-xl border border-slate-800/80 bg-[#151c2b]/30 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-[#ff6b00]" />
                  <h5 className="text-sm font-bold text-white">{method.title}</h5>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{method.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Golden Rules */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Golden Rules for Success
        </h2>

        <div className="my-8 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5 p-6 md:p-8">
          <div className="flex gap-4">
            <ShieldAlert className="h-6 w-6 shrink-0 text-red-500" />
            <div>
              <h4 className="mb-2 text-base font-bold uppercase tracking-wider text-white">
                No Physical Punishment
              </h4>
              <p className="text-sm italic leading-relaxed text-slate-300">
                Never rub their nose in it, yell, or hit the puppy. This only teaches them to hide
                and go in secret spots (under the couch, behind curtains).
              </p>
            </div>
          </div>
        </div>

        <div className="my-8 rounded-2xl border border-slate-800 bg-[#151c2b] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff6b00]/10 text-[#ff6b00]">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h4 className="mb-2 text-base font-bold text-white">Schedule &amp; Reward</h4>
              <p className="text-sm leading-relaxed text-slate-300">
                Feed and walk your puppy on a strict routine, and praise right actions warmly and
                generously. Your puppy should feel that going potty in the right spot is the most
                rewarding thing in the world.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Actions */}
      <div className="mt-16 border-t border-slate-800 pt-8">
        <h4 className="mb-4 text-lg font-bold text-white">More Bulldog Owner Essentials</h4>
        <p className="mb-6 text-sm leading-relaxed text-slate-300">
          Potty training is just the beginning. For everything else new bulldog owners need to know,
          or if you&rsquo;re ready to bring one home, you can:
        </p>

        <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/blog/ultimate-guide-for-new-bulldog-owners"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>Read the Ultimate Guide for New Owners</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/puppies"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>View our available puppies</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>Contact Exotic Bulldog Legacy</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/faq"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>Read our FAQ</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
