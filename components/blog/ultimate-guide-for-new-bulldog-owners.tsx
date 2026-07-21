'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Heart,
  Lightbulb,
  ShieldAlert,
  Wind,
  Thermometer,
  Waves,
  Sparkles,
} from 'lucide-react';

export function UltimateGuideForNewBulldogOwners() {
  const climateChecklist = [
    'Run the AC during summer — it’s your bulldog’s favorite napping environment',
    'Walk during cool early mornings or late evenings on hot days',
    'Keep afternoon potty breaks to a strict 5 minutes, then head back inside',
    'Always have fresh, cool water available',
  ];

  const waterChecklist = [
    'Securely fence off backyard pools — bulldogs cannot swim on their own',
    'Equip your bulldog with a quality canine life jacket for lakes, rivers, and beaches',
    'Never leave a bulldog unsupervised near open water',
  ];

  return (
    <article className="prose prose-invert max-w-none font-sans text-slate-300">
      {/* Intro section */}
      <div className="space-y-6">
        <p className="text-xl font-medium leading-relaxed text-slate-200">
          French and English Bulldogs are not just dogs; they are charismatic family members with
          the personality of a CEO and the face of an angel.
        </p>
        <p className="leading-relaxed">
          There are many myths surrounding their health, but let&rsquo;s be honest: owning a bulldog
          isn&rsquo;t about managing a &ldquo;sick breed&rdquo;&mdash;it is simply a unique,
          rewarding lifestyle. With the right understanding, these sturdy companions will bring you
          endless love, joy, and hilarious snorts for years to come.
        </p>
        <p className="leading-relaxed">
          Here is your essential guide to making life with your{' '}
          <Link
            href="/puppies"
            className="text-white underline transition-colors hover:text-[#ff6b00]"
          >
            French Bulldog or English Bulldog
          </Link>{' '}
          absolute perfection.
        </p>
      </div>

      {/* Philosophy Callout */}
      <div className="my-10 overflow-hidden rounded-2xl border-l-4 border-[#ff6b00] bg-[#151c2b]/50 p-6 md:p-8">
        <div className="flex gap-4">
          <Heart className="h-6 w-6 shrink-0 text-[#ff6b00]" />
          <div>
            <h4 className="mb-2 text-base font-bold uppercase tracking-wider text-white">
              A Different Kind of Companion
            </h4>
            <p className="italic text-slate-300">
              Bulldogs are sensitive, compact, and powerful &mdash; and they deserve owners who
              understand their unique needs. This guide covers the seven essentials every new
              bulldog family should know.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Respiratory Anatomy */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          1. Respiratory Anatomy: The Secret Behind the Snore
        </h2>
        <p className="leading-relaxed">
          A bulldog&rsquo;s main trademark is that unforgettable, adorable face. The physics here
          are simple: a shortened muzzle makes them incredibly cute, but it also means things are a
          bit compact inside. A slightly elongated soft palate can sometimes restrict airflow, which
          is why bulldogs produce their signature snorts.
        </p>

        <div className="my-8 rounded-2xl border border-slate-800 bg-[#151c2b] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff6b00]/10 text-[#ff6b00]">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <h4 className="mb-2 text-base font-bold text-white">Modern Care</h4>
              <p className="text-sm leading-relaxed text-slate-300">
                If your bulldog snores unusually loud or tires quickly, modern veterinary medicine
                offers a seamless solution. A gentle, virtually bloodless procedure using a CO2
                laser allows veterinarians to adjust the soft palate and open up the nostrils.
                Because the laser seals blood vessels as it cuts, there is minimal bleeding, no
                uncomfortable stitches, and very little post-operative swelling. Dogs typically wake
                up and start breathing freely almost immediately &mdash; think of it as opening a
                window to a fresh breeze!
              </p>
            </div>
          </div>
        </div>

        <div className="my-10 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5 p-6 md:p-8">
          <div className="flex gap-4">
            <ShieldAlert className="h-6 w-6 shrink-0 text-red-500" />
            <div>
              <h4 className="mb-2 text-base font-bold uppercase tracking-wider text-white">
                Why a Harness Is Essential
              </h4>
              <p className="text-sm italic leading-relaxed text-slate-300">
                To protect your dog&rsquo;s throat and sensitive airway, skip the neck collar for
                walks. A properly fitted, anatomical Y-harness is a must. It safely distributes
                pressure across the strong bones of the chest, keeping the neck completely free so
                your bulldog can explore the world in total comfort.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Climate Control */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          2. Climate Control: Keeping It Cool
        </h2>
        <p className="leading-relaxed">
          Bulldogs are warm-hearted, but because of their shortened muzzles, they do not cool down
          as efficiently as long-snouted breeds. During warm weather, proactive care is key:
        </p>

        <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {climateChecklist.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-[#151c2b]/30 p-4 transition-all hover:border-[#ff6b00]/20 hover:bg-[#151c2b]/50"
            >
              <Thermometer className="h-5 w-5 shrink-0 text-[#ff6b00]" />
              <span className="text-sm font-medium text-slate-200">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Physical Activity */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          3. Physical Activity: Companions, Not Marathoners
        </h2>
        <p className="leading-relaxed">
          If you are looking for a running partner to join you on a 10-mile bike ride, a bulldog
          might not be the right match! Bulldogs prefer a leisurely, polite stroll where they can
          sniff every bush and receive compliments from passersby. They are playful and energetic,
          but exercise should always be fun and moderate &mdash; never exhausting.
        </p>
      </div>

      {/* 4. Water Safety */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          4. Water Safety: Bulldogs Aren&rsquo;t Natural Swimmers
        </h2>
        <p className="leading-relaxed">
          Bulldogs and open water require special attention. Due to their dense muscle structure,
          heavy bone frame, and short legs, French and English Bulldogs naturally sink like stones
          and cannot swim safely on their own.
        </p>
        <p className="leading-relaxed">
          Planning a trip to the beach, lake, or river? Absolutely! Just equip your bulldog with a
          high-quality canine life jacket. They will look like a stylish lifeguard and stay
          completely safe while splashing around with you.
        </p>

        <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {waterChecklist.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-[#151c2b]/30 p-4 transition-all hover:border-[#ff6b00]/20 hover:bg-[#151c2b]/50"
            >
              <Waves className="h-5 w-5 shrink-0 text-[#ff6b00]" />
              <span className="text-sm font-medium text-slate-200">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Protecting Joints & Spine */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          5. Protecting Joints &amp; Spine: Sleeping in Comfort
        </h2>
        <p className="leading-relaxed">
          It&rsquo;s no secret that bulldogs love to curl up on the bed and snore right in your ear.
          There&rsquo;s no need to deny them that cozy bonding time, but you do need to protect
          their back and joints from high-impact landings.
        </p>
        <p className="leading-relaxed">
          Repeatedly jumping off high beds or couches onto hard floors places unnecessary strain on
          their spine and joints.
        </p>

        <div className="my-8 rounded-2xl border border-slate-800 bg-[#151c2b] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff6b00]/10 text-[#ff6b00]">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h4 className="mb-2 text-base font-bold text-white">Key Idea</h4>
              <p className="text-sm leading-relaxed text-slate-300">
                To keep them safe without sacrificing cuddles, place pet ramps or padded steps next
                to your furniture. Bulldogs learn to use them quickly, and their joints will thank
                you for years to come.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Hygiene */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          6. Hygiene in &ldquo;Special Zones&rdquo;: Wrinkles &amp; Tail Pockets
        </h2>
        <p className="leading-relaxed">
          Caring for a bulldog is simple once you build it into a quick, pleasant routine:
        </p>

        <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800/80 bg-[#151c2b]/30 p-5">
            <div className="mb-3 flex items-center gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-[#ff6b00]" />
              <h5 className="text-sm font-bold text-white">Facial Wrinkles</h5>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Moisture and dust can accumulate in the facial folds. Gently wipe them clean using a
              soft, alcohol-free wipe or micellar water, and always dry the skin thoroughly
              afterward. The golden rule of wrinkle care is keeping the skin dry.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-[#151c2b]/30 p-5">
            <div className="mb-3 flex items-center gap-3">
              <Sparkles className="h-5 w-5 shrink-0 text-[#ff6b00]" />
              <h5 className="text-sm font-bold text-white">Tail Pockets</h5>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Some bulldogs (especially English Bulldogs) have very tight tails that create a deep
              indentation or &ldquo;tail pocket&rdquo; underneath. Keep this area clean by gently
              removing loose skin flakes and applying a soothing, drying powder if needed.
            </p>
          </div>
        </div>
      </div>

      {/* 7. Nutrition */}
      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          7. Nutrition: The Foundation of Long-Term Health
        </h2>
        <p className="leading-relaxed">
          A bulldog&rsquo;s overall health, coat quality, clear skin, and muscle tone depend
          directly on what goes into their food bowl. Health begins from within, and this breed
          thrives when fed a fresh, thoughtful, and appropriate diet.
        </p>
        <p className="leading-relaxed">
          Because proper nutrition plays such a vital role in preventing common issues, it deserves
          dedicated attention. For a deep dive into building a healthy diet and raising thriving
          puppies, read our{' '}
          <Link
            href="/blog/dry-food-vs-raw-diet-bulldogs"
            className="text-white underline transition-colors hover:text-[#ff6b00]"
          >
            Bulldog Nutrition guide on dry food vs. raw diet
          </Link>
          .
        </p>
      </div>

      {/* Call to Actions */}
      <div className="mt-16 border-t border-slate-800 pt-8">
        <h4 className="mb-4 text-lg font-bold text-white">Ready to Welcome Your Bulldog Home?</h4>
        <p className="mb-6 text-sm leading-relaxed text-slate-300">
          If you are looking for a French or English Bulldog puppy raised with a
          health-and-comfort-focused philosophy, you can:
        </p>

        <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
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
          <Link
            href="/blog/puppy-potty-training-101"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>Next: Puppy Potty Training 101</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
