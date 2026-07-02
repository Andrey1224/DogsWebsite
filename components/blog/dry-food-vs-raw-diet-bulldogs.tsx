'use client';

import Link from 'next/link';
import { CheckCircle2, ArrowRight, ArrowDown, ShieldAlert, Lightbulb, Heart } from 'lucide-react';

export function DryFoodVsRawDietBulldogs() {
  const allergySymptoms = [
    'Constant itching & scratching',
    'Red, inflamed paws & chewing',
    'Inflamed ears & recurrent infections',
    'Irritated, flaky skin',
    'Dull, dry coat',
    'Recurring yeast smell & infections',
    'Digestive upset & chronic bloating',
    'Loose, foul-smelling stools',
  ];

  const puppyNeeds = [
    'Strong digestive development',
    'Clean, nutrient-dense nutrition',
    'Balanced gut flora (microbiome)',
    'Excellent, firm stool quality',
    'Healthy, resilient skin & coat',
    'Minimized inflammatory stress',
    'Properly balanced immune system response',
  ];

  const kibbleCycle = [
    {
      title: 'High-Starch Kibble',
      desc: 'Loaded with carbohydrates needed to hold dry pellet shape',
      color: 'border-red-900/30 bg-red-950/10 text-red-400',
    },
    {
      title: 'Altered Gut Environment',
      desc: 'Starch shifts pH and alters delicate stomach conditions',
      color: 'border-red-950 bg-red-950/20 text-red-300',
    },
    {
      title: 'Yeast & Bad Bacteria',
      desc: 'Sugar-forming starches feed opportunistic pathogens',
      color: 'border-orange-900/30 bg-orange-950/10 text-orange-400',
    },
    {
      title: 'Damaged Microbiome',
      desc: 'Healthy bacteria are crowded out, leading to dysbiosis',
      color: 'border-orange-950 bg-orange-950/20 text-orange-300',
    },
    {
      title: 'Immune Stress',
      desc: '70%+ of immune system lives in the gut; it goes into overdrive',
      color: 'border-amber-900/30 bg-amber-950/10 text-amber-400',
    },
    {
      title: 'Allergy Symptoms',
      desc: 'Chronic itching, red paws, yeast infections, loose stools',
      color: 'border-red-500/20 bg-red-500/5 text-red-200 font-semibold',
    },
  ];

  const rawPath = [
    {
      title: 'Fresh Raw Meat & Organs',
      desc: 'Biologically appropriate, undamaged animal protein sources',
      color: 'border-emerald-900/30 bg-emerald-950/10 text-emerald-400',
    },
    {
      title: 'Strong Stomach Acidity',
      desc: 'Encourages highly acidic environment (pH 1-2) to process raw bone',
      color: 'border-emerald-950 bg-emerald-950/20 text-emerald-300',
    },
    {
      title: 'Pathogen Defense',
      desc: 'High acidity kills bad bacteria, protecting the system',
      color: 'border-teal-900/30 bg-teal-950/10 text-teal-400',
    },
    {
      title: 'Balanced Microbiome',
      desc: 'Whole food nourishes and diversifies beneficial microbes',
      color: 'border-teal-950 bg-teal-950/20 text-teal-300',
    },
    {
      title: 'Strong Gut Barrier',
      desc: 'Intact gut lining prevents leakage of allergens into the blood',
      color: 'border-cyan-900/30 bg-cyan-950/10 text-cyan-400',
    },
    {
      title: 'Vibrant Health',
      desc: 'Calm immune system, clean skin, rich coat, and perfect stools',
      color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-200 font-semibold',
    },
  ];

  return (
    <article className="prose prose-invert max-w-none font-sans text-slate-300">
      {/* Intro section */}
      <div className="space-y-6">
        <p className="text-xl font-medium leading-relaxed text-slate-200">
          Many bulldog owners are stuck in the same frustrating cycle.
        </p>
        <p className="leading-relaxed">
          Their dog starts itching. The paws turn red. Ear infections keep coming back. The stool
          becomes loose. Gas becomes normal. The skin gets irritated. Then the owner changes kibble
          brands, buys another “hypoallergenic” bag, tries a veterinary diet, uses creams or
          medications — and for a short time, things may look better.
        </p>
        <p className="leading-relaxed">But then the same problems return.</p>
        <p className="leading-relaxed">
          At Exotic Bulldog Legacy, we believe the issue often goes deeper than one ingredient. The
          problem is not simply “chicken,” “beef,” or “grain.” The bigger problem is the nature of
          dry food itself.
        </p>
      </div>

      {/* Philosophy Callout */}
      <div className="my-10 overflow-hidden rounded-2xl border-l-4 border-[#ff6b00] bg-[#151c2b]/50 p-6 md:p-8">
        <div className="flex gap-4">
          <Heart className="h-6 w-6 shrink-0 text-[#ff6b00]" />
          <div>
            <h4 className="mb-2 text-base font-bold text-white uppercase tracking-wider">
              Our Philosophy
            </h4>
            <p className="text-slate-300 italic">
              This article reflects our feeding philosophy at Exotic Bulldog Legacy. We believe
              <Link
                href="/puppies"
                className="text-white hover:text-[#ff6b00] underline ml-1 mr-1 transition-colors"
              >
                French Bulldogs and English Bulldogs
              </Link>
              thrive when they are raised on real, fresh, species-appropriate nutrition instead of
              highly processed industrial kibble.
            </p>
          </div>
        </div>
      </div>

      {/* Why Industrial Kibble is a Problem */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold text-white md:text-3xl mt-12 mb-6 border-b border-slate-800 pb-2">
          Why Industrial Kibble Is a Problem for Bulldogs
        </h2>
        <p className="leading-relaxed">
          Commercial dry food is convenient, shelf-stable, and heavily marketed. But convenience
          does not make it biologically appropriate for French Bulldogs or English Bulldogs.
        </p>
        <p className="leading-relaxed">
          Bulldogs are sensitive dogs. Their skin, digestion, immune system, and microbiome are
          deeply connected. When the gut is constantly stressed by highly processed food, the
          symptoms often show up on the outside: itching, red paws, yeast, ear problems, gas, loose
          stools, and chronic inflammation.
        </p>
        <p className="leading-relaxed">
          In our view, many bulldog “allergy problems” are not only skin problems. They are gut
          problems showing up through the skin.
        </p>
      </div>

      {/* 1. High-Heat Processing */}
      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-bold text-white md:text-2xl mt-10">
          1. High-Heat Processing Damages Natural Proteins
        </h3>
        <p className="leading-relaxed">
          Commercial kibble is made through a process called extrusion. Ingredients are mixed,
          processed, and cooked under high heat and pressure to create a dry pellet.
        </p>
        <p className="leading-relaxed">That process changes the natural structure of the food.</p>
        <p className="leading-relaxed">
          Proteins that were once fresh and biologically recognizable become damaged by heat. During
          this high-temperature processing, compounds known as Advanced Glycation End-products, or
          AGEs, can form.
        </p>
        <p className="leading-relaxed">
          AGEs are one of the reasons we believe industrial kibble can create chronic stress inside
          the body. When a bulldog eats damaged, overprocessed proteins every day, the immune system
          may stay irritated and overactive.
        </p>
        <p className="leading-relaxed">
          That is when owners begin to see symptoms that look like “food allergies”:
        </p>

        {/* Symptoms Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
          {allergySymptoms.map((symptom, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-[#151c2b]/30 p-4 transition-all hover:border-[#ff6b00]/20 hover:bg-[#151c2b]/50"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#ff6b00]" />
              <span className="text-slate-200 text-sm font-medium">{symptom}</span>
            </div>
          ))}
        </div>

        {/* Callout: Key Idea */}
        <div className="my-8 rounded-2xl border border-slate-800 bg-[#151c2b] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff6b00]/10 text-[#ff6b00]">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div>
              <h4 className="mb-2 text-base font-bold text-white">Key Idea</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                The problem is not only what ingredient is in the bag. The problem is what
                industrial processing does to that ingredient.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. High Carbohydrates */}
      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-bold text-white md:text-2xl mt-10">
          2. High Carbohydrates Feed the Wrong Microbiome
        </h3>
        <p className="leading-relaxed">To form a dry kibble pellet, manufacturers need starch.</p>
        <p className="leading-relaxed">
          That is why many dry foods contain large amounts of carbohydrate sources such as corn,
          wheat, peas, potatoes, rice, lentils, or other starches. Even when the front of the bag
          looks “premium,” the food still needs starch to hold its shape.
        </p>
        <p className="leading-relaxed">
          But bulldogs were not designed to thrive on a high-starch, dry, processed diet.
        </p>
        <p className="leading-relaxed">
          A high-carbohydrate diet can shift the gut environment in the wrong direction. Instead of
          supporting a strong, balanced microbiome, it can create conditions where yeast, fungus,
          and pathogenic bacteria become harder to control.
        </p>

        {/* Kibble Cycle Flow Diagram */}
        <div className="my-10 space-y-4">
          <h4 className="text-sm font-bold tracking-wider text-red-400 uppercase text-center mb-6">
            The Kibble Inflammation Cycle
          </h4>

          {/* Desktop flow (horizontal cards) */}
          <div className="hidden lg:flex items-stretch justify-between gap-2">
            {kibbleCycle.map((step, idx) => (
              <div key={idx} className="flex items-center w-full">
                <div
                  className={`flex flex-col p-4 rounded-xl border text-center h-full justify-between flex-1 ${step.color}`}
                >
                  <span className="text-xs text-slate-500 font-bold mb-1">STEP 0{idx + 1}</span>
                  <h5 className="text-sm font-bold text-white mb-2 leading-tight">{step.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-normal">{step.desc}</p>
                </div>
                {idx < kibbleCycle.length - 1 && (
                  <ArrowRight className="h-5 w-5 mx-1 shrink-0 text-red-900/50" />
                )}
              </div>
            ))}
          </div>

          {/* Mobile flow (vertical stack) */}
          <div className="flex lg:hidden flex-col items-center space-y-2 max-w-md mx-auto">
            {kibbleCycle.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center w-full">
                <div className={`p-5 rounded-xl border text-center w-full ${step.color}`}>
                  <span className="text-xs text-slate-500 font-bold block mb-1">
                    STEP 0{idx + 1}
                  </span>
                  <h5 className="text-base font-bold text-white mb-2 leading-tight">
                    {step.title}
                  </h5>
                  <p className="text-xs text-slate-400 leading-normal">{step.desc}</p>
                </div>
                {idx < kibbleCycle.length - 1 && (
                  <ArrowDown className="h-5 w-5 my-2 text-red-900/50" />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="leading-relaxed">
          This is why changing from one kibble brand to another often does not solve the problem.
          The label changes, but the food system remains the same: dry, processed, starch-heavy
          pellets.
        </p>
      </div>

      {/* 3. Gut Damage */}
      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-bold text-white md:text-2xl mt-10">
          3. Gut Damage Can Trigger Skin and Allergy Symptoms
        </h3>
        <p className="leading-relaxed">
          The gut lining is supposed to act like a strong barrier. It should absorb nutrients while
          keeping harmful particles, toxins, and bacteria where they belong.
        </p>
        <p className="leading-relaxed">
          But when the gut is constantly irritated, that barrier can weaken.
        </p>
        <p className="leading-relaxed">
          As the microbiome becomes imbalanced and the gut lining becomes stressed, unwanted
          particles may pass through the intestinal wall. The immune system sees those particles as
          invaders and reacts.
        </p>
        <p className="leading-relaxed">
          This is why we believe bulldog skin issues must be viewed from the inside out. Creams,
          wipes, shampoos, and medications may calm symptoms temporarily, but if the gut is still
          being irritated every day, the cycle continues.
        </p>

        {/* Warning Callout */}
        <div className="my-10 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/5 p-6 md:p-8">
          <div className="flex gap-4">
            <ShieldAlert className="h-6 w-6 shrink-0 text-red-500" />
            <div>
              <h4 className="mb-2 text-base font-bold text-white uppercase tracking-wider">
                Critical Gut Warning
              </h4>
              <p className="text-slate-300 italic text-sm leading-relaxed">
                Bulldog skin problems often start in the gut. Itching, red paws, yeast, and gas are
                external signs of internal imbalance. You cannot truly fix an internal gut problem
                by only treating the skin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Raw Feeding Philosophy */}
      <div className="mt-16 space-y-6">
        <h2 className="text-2xl font-bold text-white md:text-3xl border-b border-slate-800 pb-2">
          The Raw Feeding Philosophy
        </h2>
        <p className="leading-relaxed">
          At Exotic Bulldog Legacy, our belief is simple: bulldogs need real food.
        </p>
        <p className="leading-relaxed">
          Fresh raw meat, organs, bone, fish, and carefully selected whole-food additions provide
          the kind of nutrition that dry industrial pellets cannot offer. Raw, species-appropriate
          feeding supports the body in a completely different way:
        </p>

        {/* Raw Path Flow Diagram */}
        <div className="my-10 space-y-4">
          <h4 className="text-sm font-bold tracking-wider text-emerald-400 uppercase text-center mb-6">
            The Raw Health Cycle
          </h4>

          {/* Desktop flow (horizontal cards) */}
          <div className="hidden lg:flex items-stretch justify-between gap-2">
            {rawPath.map((step, idx) => (
              <div key={idx} className="flex items-center w-full">
                <div
                  className={`flex flex-col p-4 rounded-xl border text-center h-full justify-between flex-1 ${step.color}`}
                >
                  <span className="text-xs text-slate-500 font-bold mb-1">STAGE 0{idx + 1}</span>
                  <h5 className="text-sm font-bold text-white mb-2 leading-tight">{step.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-normal">{step.desc}</p>
                </div>
                {idx < rawPath.length - 1 && (
                  <ArrowRight className="h-5 w-5 mx-1 shrink-0 text-emerald-950" />
                )}
              </div>
            ))}
          </div>

          {/* Mobile flow (vertical stack) */}
          <div className="flex lg:hidden flex-col items-center space-y-2 max-w-md mx-auto">
            {rawPath.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center w-full">
                <div className={`p-5 rounded-xl border text-center w-full ${step.color}`}>
                  <span className="text-xs text-slate-500 font-bold block mb-1">
                    STAGE 0{idx + 1}
                  </span>
                  <h5 className="text-base font-bold text-white mb-2 leading-tight">
                    {step.title}
                  </h5>
                  <p className="text-xs text-slate-400 leading-normal">{step.desc}</p>
                </div>
                {idx < rawPath.length - 1 && (
                  <ArrowDown className="h-5 w-5 my-2 text-emerald-950" />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="leading-relaxed">
          Raw food provides moisture, natural enzymes, dense nutrition, and biologically appropriate
          animal-based ingredients. It works with the bulldog’s body instead of forcing the body to
          adapt to a sterile, high-starch pellet.
        </p>
      </div>

      {/* Why Stomach Acidity Matters */}
      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-bold text-white md:text-2xl mt-10">
          Why Stomach Acidity Matters
        </h3>
        <p className="leading-relaxed">
          A healthy dog’s stomach is designed to be highly acidic. That acidity helps break down raw
          meat, bone, and connective tissue. It also helps defend against harmful bacteria.
        </p>
        <p className="leading-relaxed">
          When a dog is fed fresh animal-based food, the body is encouraged to maintain the strong
          digestive environment it was designed for.
        </p>
        <p className="leading-relaxed">
          Dry kibble changes that picture. Because kibble is dry, processed, and often high in
          carbohydrates, it does not support digestion in the same way. Over time, we believe this
          can weaken the gut environment and make bulldogs more vulnerable to yeast, bad bacteria,
          poor digestion, and inflammation.
        </p>
        <p className="leading-relaxed">
          A bulldog with a strong gut is better equipped to handle food, absorb nutrients, maintain
          healthy stool, and keep the immune system calm.
        </p>
      </div>

      {/* Why Bulldogs Should Start from Puppyhood */}
      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-bold text-white md:text-2xl mt-10">
          Why Bulldogs Should Start This Way From Puppyhood
        </h3>
        <p className="leading-relaxed">
          Bulldogs are not average dogs. They are sensitive, compact, powerful, and genetically
          unique. Their skin, breathing, digestion, and immune health must be protected from the
          beginning. That is why nutrition from puppyhood matters so much.
        </p>
        <p className="leading-relaxed">
          When a puppy is raised on real, fresh, species-appropriate nutrition, the foundation is
          different. The gut has a better chance to develop properly, the microbiome has a better
          chance to stay balanced, and the immune system has less reason to stay in constant defense
          mode.
        </p>
        <p className="leading-relaxed">A bulldog puppy’s future health is built through:</p>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
          {puppyNeeds.map((need, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-[#151c2b]/30 p-4 hover:border-[#ff6b00]/20 hover:bg-[#151c2b]/50 transition-all"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <span className="text-slate-200 text-sm font-medium">{need}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What This Means for Owners */}
      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-bold text-white md:text-2xl mt-10">
          What This Means for Bulldog Owners
        </h3>
        <p className="leading-relaxed">
          If your bulldog struggles with itching, red paws, ear issues, gas, loose stool, or yeast,
          do not only ask: “What kibble brand should I try next?”
        </p>
        <p className="leading-relaxed">
          A better question is:{' '}
          <strong className="text-white">
            “Is this food system actually supporting my bulldog’s biology?”
          </strong>
        </p>
        <p className="leading-relaxed">Look at the whole picture:</p>
        <ul className="list-none pl-0 space-y-3 my-6">
          <li className="flex items-start gap-3">
            <span className="text-[#ff6b00] mt-1 shrink-0">•</span>
            <span>Is the food fresh or highly processed?</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#ff6b00] mt-1 shrink-0">•</span>
            <span>Is it animal-based or starch-heavy?</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#ff6b00] mt-1 shrink-0">•</span>
            <span>Is it moisture-rich or dry?</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#ff6b00] mt-1 shrink-0">•</span>
            <span>Does it support the gut or irritate it?</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-[#ff6b00] mt-1 shrink-0">•</span>
            <span>Is the microbiome becoming stronger or weaker?</span>
          </li>
        </ul>
        <p className="leading-relaxed">
          Many owners spend years treating the outside of the dog while ignoring the inside. But
          true bulldog health starts from the inside out.
        </p>
      </div>

      {/* Our Position */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold text-white md:text-3xl border-b border-slate-800 pb-2">
          Our Position at Exotic Bulldog Legacy
        </h2>
        <p className="leading-relaxed">
          We do not believe bulldogs are meant to thrive on sterile, high-starch industrial pellets.
          We believe French Bulldogs and English Bulldogs deserve real food, real nutrition, and a
          feeding philosophy that respects how their bodies are designed to work.
        </p>
        <p className="leading-relaxed">
          That does not mean feeding randomly. Raw feeding must be done with structure, balance, and
          knowledge. Muscle meat, bone, organs, fish, and supportive additions all have their place.
        </p>
        <p className="leading-relaxed">
          But the foundation is clear:{' '}
          <strong className="text-white">Real food builds real health.</strong>
        </p>
      </div>

      {/* Final Thoughts */}
      <div className="mt-12 space-y-6">
        <h3 className="text-xl font-bold text-white md:text-2xl mt-10">
          Final Thoughts: True Bulldog Health Starts in the Gut
        </h3>
        <p className="leading-relaxed">
          You cannot fix a systemic gut problem with a sterile, highly processed dry pellet. True
          health for French and English Bulldogs begins with real, raw, bio-appropriate nutrition
          from puppyhood to adult life.
        </p>
        <p className="leading-relaxed">
          When the gut becomes stronger, the whole dog changes: the skin calms down, the coat
          improves, the stool becomes better, the immune system becomes less reactive, and the dog
          can finally begin to thrive instead of simply survive.
        </p>
        <p className="leading-relaxed">
          At Exotic Bulldog Legacy, this is not just a diet opinion. It is part of our breeding
          philosophy. Healthy bulldogs start with healthy foundations — and the gut is one of the
          most important foundations of all.
        </p>
      </div>

      {/* Next Article Preview */}
      <div className="mt-16 border-t border-slate-800 pt-8">
        <h4 className="text-lg font-bold text-white mb-4">What to Read Next</h4>
        <p className="leading-relaxed text-slate-400 mb-6 text-sm">
          In the next article, we will break down the exact raw feeding percentages for a growing
          bulldog puppy, including muscle meat, bone, organs, fish, and supportive supplements.
        </p>

        {/* Call to Actions */}
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          If you are looking for a French or English Bulldog puppy raised with a health-focused
          philosophy, you can:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <Link
            href="/puppies"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-[#151c2b] text-slate-200 hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all font-medium text-sm"
          >
            <span>View our available puppies</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-[#151c2b] text-slate-200 hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all font-medium text-sm"
          >
            <span>Contact Exotic Bulldog Legacy</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/faq"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-[#151c2b] text-slate-200 hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all font-medium text-sm"
          >
            <span>Read our FAQ</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/policies"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-[#151c2b] text-slate-200 hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all font-medium text-sm"
          >
            <span>Review health & deposit policies</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/locations"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-[#151c2b] text-slate-200 hover:border-[#ff6b00] hover:text-[#ff6b00] transition-all font-medium text-sm"
          >
            <span>Pickup & Delivery in Alabama</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
