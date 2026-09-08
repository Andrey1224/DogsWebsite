import Link from 'next/link';
import {
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  ShieldAlert,
  FileText,
  HeartPulse,
  Activity,
} from 'lucide-react';

export function ChooseHealthyBulldogPuppy() {
  const whatChecking = [
    'Parent Health Background',
    'Puppy Veterinary Examination',
    'Records & Documentation',
    'Responsible Care After Pickup',
  ];

  const dnaStatuses = [
    {
      title: 'CLEAR / NON-CARRIER',
      desc: 'No tested mutation detected. The dog is not expected to pass a disease-associated copy to its offspring.',
      color: 'border-emerald-900/30 bg-emerald-950/10 text-emerald-400',
    },
    {
      title: 'CARRIER',
      desc: 'One copy detected. For many recessive conditions, carriers themselves do not develop the disease.',
      color: 'border-sky-900/30 bg-sky-950/10 text-sky-400',
    },
    {
      title: 'AT RISK / AFFECTED',
      desc: 'Disease-associated genotype detected. Exact interpretation depends on the specific disease and inheritance pattern.',
      color: 'border-red-900/30 bg-red-950/10 text-red-400',
    },
  ];

  const vetChecklist = [
    {
      area: 'Heart & Lungs',
      desc: 'Heart sounds, respiratory sounds, obvious murmurs or abnormalities',
    },
    {
      area: 'Nostrils & Breathing',
      desc: 'Airway appearance, nostril openings, obvious respiratory difficulty',
    },
    { area: 'Eyes', desc: 'Discharge, inflammation and visible abnormalities' },
    { area: 'Ears', desc: 'Clean canals and signs of irritation, infection or parasites' },
    { area: 'Mouth & Jaw', desc: 'Oral tissues and visible development of the mouth/jaw' },
    { area: 'Joints & Mobility', desc: 'Gait, movement and obvious musculoskeletal abnormalities' },
    { area: 'Abdomen', desc: 'General abdominal examination and possible hernias' },
    { area: 'Skin & Coat', desc: 'Irritation, dermatitis, parasites and general condition' },
    { area: 'Male Anatomy', desc: 'Testicular position when age-appropriate' },
    {
      area: 'General Condition',
      desc: 'Weight, hydration, temperature and overall physical condition',
    },
  ];

  const threeLayers = [
    {
      title: 'HEALTH-TESTED BREEDING DECISIONS',
      desc: 'Parents + genetics + appropriate screening',
      color: 'border-sky-900/30 bg-sky-950/10 text-sky-400',
      icon: Activity,
    },
    {
      title: 'PUPPY VETERINARY CARE',
      desc: 'Physical exam + records + vaccines + parasite control',
      color: 'border-emerald-900/30 bg-emerald-950/10 text-emerald-400',
      icon: HeartPulse,
    },
    {
      title: 'RESPONSIBLE OWNER CARE',
      desc: 'Weight + joints + heat safety + routine veterinary care',
      color: 'border-purple-900/30 bg-purple-950/10 text-purple-400',
      icon: ShieldAlert,
    },
  ];

  const buyerQuestions = [
    "What health testing was performed on the puppy's sire and dam?",
    'Can I see the available laboratory or OFA results?',
    'Which conditions were actually tested?',
    'Has the puppy been examined by a licensed veterinarian?',
    'Can I see the veterinary and vaccination records?',
    'What deworming and parasite screening has been performed?',
    'Are there any health findings I should know about?',
    'What health guarantee comes with the puppy?',
    'When should my veterinarian examine the puppy after pickup?',
    'Who can I contact if I have health questions after bringing the puppy home?',
  ];

  return (
    <article className="prose prose-invert max-w-none font-sans text-slate-300">
      <div className="space-y-6">
        <p className="text-xl font-medium leading-relaxed text-slate-200">
          Bringing home a French or English Bulldog puppy is an exciting milestone.
        </p>
        <p className="leading-relaxed">
          It is easy to fall in love with the wrinkles, expressive eyes, bat ears, compact body, or
          a beautiful coat color. But appearance should never be the only thing you evaluate when
          choosing a puppy.
        </p>
        <p className="leading-relaxed">
          Behind every healthy puppy should be something much more important:
        </p>
        <p className="leading-relaxed font-bold text-white">
          thoughtful breeding, documented health screening, veterinary care, and transparency from
          the breeder.
        </p>
        <p className="leading-relaxed">
          You do not need a veterinary degree or an advanced understanding of canine genetics to ask
          the right questions. You simply need to know{' '}
          <strong className="text-white">
            what documentation to request and what a responsible breeder should be willing to
            discuss with you.
          </strong>
        </p>

        <div className="my-8 rounded-2xl border border-sky-900/30 bg-sky-950/10 p-6 md:p-8">
          <h4 className="mb-2 text-base font-bold uppercase tracking-wider text-sky-400">
            Our Health Philosophy
          </h4>
          <p className="text-sm italic leading-relaxed text-slate-300">
            At Exotic Bulldog Legacy, we believe buyers should understand the health background of
            the puppy they are considering. Ask questions, review the available records for the
            specific litter, and understand what veterinary care your puppy has received before
            going home.
          </p>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          What You&apos;re Really Checking
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whatChecking.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#151c2b] p-5 text-sm font-medium text-white transition-colors hover:border-slate-700"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-400">
                {idx + 1}
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Start With the Parents, Not Just the Puppy
        </h2>
        <p className="leading-relaxed">
          A puppy&apos;s health story begins before the puppy is born. Genetic screening of breeding
          dogs can help breeders identify certain inherited mutations and make more informed
          decisions when selecting a sire and dam.
        </p>
        <p className="leading-relaxed">
          DNA testing cannot predict every health problem a dog may ever develop. But for conditions
          with established genetic tests, it provides valuable information about the parents and
          potential risks to their offspring. OFA specifically recommends that prospective puppy
          buyers research health testing on parents and relatives when evaluating a breeder.
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">Ask to See the Actual Results</h3>
        <p className="leading-relaxed">
          Do not be afraid to ask:{' '}
          <strong className="text-white">
            “What health testing was performed on the sire and dam of this litter, and can I see the
            results?”
          </strong>
        </p>
        <p className="leading-relaxed">
          A breeder should be able to explain what testing was performed for that specific pairing
          and provide the available documentation. Do not rely only on phrases such as “health
          tested,” “DNA clear,” or “vet checked.” Ask what was actually tested.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Understanding DNA Test Results
        </h2>
        <p className="leading-relaxed">
          Laboratories may use slightly different terminology, but DNA reports commonly classify a
          dog according to whether a disease-associated variant was detected.
        </p>

        <div className="my-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {dnaStatuses.map((status, idx) => (
            <div key={idx} className={`rounded-xl border p-5 ${status.color}`}>
              <h5 className="mb-2 text-sm font-bold uppercase tracking-wider">{status.title}</h5>
              <p className="text-sm leading-relaxed text-slate-300">{status.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-sm italic text-slate-400">
          * Exact interpretation depends on the specific disease and inheritance pattern.
        </p>

        <div className="my-8 rounded-2xl border border-slate-800 bg-[#151c2b] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="mb-2 text-base font-bold text-white">Key Idea</h4>
              <p className="text-sm leading-relaxed text-slate-300">
                A DNA result is not simply a “good dog / bad dog” label. The purpose of testing is
                to give breeders information they can use to make better pairing decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          DNA Health Tests Commonly Seen in French Bulldogs
        </h2>
        <p className="leading-relaxed">
          The exact testing panel depends on the laboratory and breeding program. Current French
          Bulldog panels offered by Animal Genetics include tests for conditions such as CMR1,
          Degenerative Myelopathy, Hyperuricosuria, Juvenile Hereditary Cataracts, and Cystinuria
          variants, among others.
        </p>
        <ul className="list-disc pl-6 text-slate-300">
          <li>
            <strong>Degenerative Myelopathy (DM):</strong> Associated with progressive degeneration
            of the spinal cord.
          </li>
          <li>
            <strong>Juvenile Hereditary Cataracts (JHC):</strong> An inherited form of cataract that
            can affect younger dogs.
          </li>
          <li>
            <strong>Canine Multifocal Retinopathy Type 1 (CMR1):</strong> An inherited retinal
            condition.
          </li>
          <li>
            <strong>Hyperuricosuria (HUU):</strong> Affects uric acid metabolism and can increase
            the risk of urate stones.
          </li>
          <li>
            <strong>Cystinuria:</strong> Associated with abnormal cystine levels in the urine and
            the development of urinary stones.
          </li>
        </ul>

        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          DNA Health Tests Commonly Seen in English Bulldogs
        </h2>
        <p className="leading-relaxed">
          English Bulldog panels may include several overlapping conditions. Animal Genetics
          currently lists CMR1, Cystinuria Type 3 variants, DM, and HUU among the disease-related
          tests included in its English Bulldog panel.
        </p>
        <p className="leading-relaxed font-bold text-white">
          The important point for buyers is not memorizing every abbreviation. It is understanding
          that genetic testing should be specific, documented, and interpreted in the context of the
          actual breeding pair.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          DNA Testing Is Only One Part of Bulldog Health
        </h2>
        <p className="leading-relaxed">
          One of the biggest mistakes buyers can make is assuming that a DNA panel means:{' '}
          <strong className="text-white">“This puppy can never have a health problem.”</strong>
        </p>
        <p className="leading-relaxed">
          That is not what genetic testing means. Not every health condition has a DNA test. Some
          Bulldog health concerns are evaluated through physical examination, specialist screening,
          imaging, respiratory assessment, orthopedic evaluation, or other forms of health testing.
        </p>
        <p className="leading-relaxed">
          The OFA/CHIC system specifically distinguishes DNA-based testing from phenotype-based
          health evaluations and recommends breed-specific screening protocols. For brachycephalic
          breeds such as Bulldogs and French Bulldogs, respiratory function is also an important
          consideration.
        </p>
        <p className="leading-relaxed">
          That is why choosing a puppy should involve{' '}
          <strong className="text-white">
            both the parents&apos; health background and the puppy&apos;s own veterinary
            examination.
          </strong>
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          The Pre-Sale Veterinary Checkup
        </h2>
        <p className="leading-relaxed">
          Before going to a new home, a puppy should receive an age-appropriate veterinary
          evaluation. Documentation may look different from clinic to clinic. What matters is that
          there is a documented veterinary assessment of the puppy.
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">What the Veterinarian Checks</h3>
        <div className="my-8 overflow-hidden rounded-2xl border border-slate-800 bg-[#151c2b]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {vetChecklist.map((item, idx) => (
              <div
                key={idx}
                className="flex border-b border-slate-800/50 p-4 last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0"
              >
                <div className="w-1/3 shrink-0 font-bold text-white pr-4">{item.area}</div>
                <div className="text-sm text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Three Layers of a Healthy Start
        </h2>

        <div className="my-10 space-y-4">
          <div className="hidden items-center justify-center gap-4 lg:flex">
            {threeLayers.map((layer, idx) => {
              const Icon = layer.icon;
              return (
                <div key={idx} className="flex flex-1 items-center">
                  <div
                    className={`flex w-full flex-col items-center justify-center rounded-xl border p-6 text-center ${layer.color}`}
                  >
                    <Icon className="mb-3 h-8 w-8 opacity-80" />
                    <span className="mb-2 text-sm font-bold uppercase tracking-wider">
                      {layer.title}
                    </span>
                    <span className="text-xs font-medium text-slate-300">{layer.desc}</span>
                  </div>
                  {idx < threeLayers.length - 1 && (
                    <ArrowRight className="mx-4 h-6 w-6 shrink-0 text-slate-600" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mx-auto flex max-w-sm flex-col items-center space-y-2 lg:hidden">
            {threeLayers.map((layer, idx) => {
              const Icon = layer.icon;
              return (
                <div key={idx} className="flex w-full flex-col items-center">
                  <div
                    className={`flex w-full flex-col items-center justify-center rounded-xl border p-6 text-center ${layer.color}`}
                  >
                    <Icon className="mb-3 h-8 w-8 opacity-80" />
                    <span className="mb-2 text-sm font-bold uppercase tracking-wider">
                      {layer.title}
                    </span>
                    <span className="text-xs font-medium text-slate-300">{layer.desc}</span>
                  </div>
                  {idx < threeLayers.length - 1 && (
                    <ArrowDown className="my-4 h-6 w-6 shrink-0 text-slate-600" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Questions to Ask Before Choosing a Bulldog Puppy
        </h2>

        <div className="my-8 rounded-2xl border border-slate-800 bg-[#151c2b] p-6 md:p-8">
          <div className="grid grid-cols-1 gap-4">
            {buyerQuestions.map((q, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6b00]" />
                <span className="text-slate-200">{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-slate-800 pt-8">
        <h4 className="mb-4 text-lg font-bold text-white">
          Final Thoughts: Choose Health Before Color
        </h4>
        <p className="leading-relaxed">
          There is nothing wrong with falling in love with a beautiful color, expressive face, or
          adorable personality. But those should come{' '}
          <strong className="text-white">after health and transparency</strong>, not before them.
        </p>
        <p className="leading-relaxed">
          Ask questions until you are comfortable with the answers. A beautiful puppy may catch your
          eye.{' '}
          <strong className="text-white">
            A thoughtfully bred, properly cared-for puppy should earn your confidence. Learn more
            about our approach by viewing our{' '}
            <Link href="/puppies" className="text-[#ff6b00] hover:underline">
              available puppies
            </Link>{' '}
            or reviewing our{' '}
            <Link href="/terms" className="text-[#ff6b00] hover:underline">
              health guarantee and deposit terms
            </Link>
            .
          </strong>
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
            href="/terms"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>Health & Deposit Policy</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/faq"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>Frequently Asked Questions</span>
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
