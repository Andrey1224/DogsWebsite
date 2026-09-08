import Link from 'next/link';
import { ArrowRight, AlertTriangle, Beaker, Activity, Beef } from 'lucide-react';

export function HighCarbCommercialDogFoodRisks() {
  return (
    <article className="prose prose-invert max-w-none font-sans text-slate-300">
      {/* Intro section */}
      <div className="space-y-6">
        <p className="text-xl font-medium leading-relaxed text-slate-200">
          With the rise of the commercial pet food industry, many dog owners are noticing increasing
          health issues such as allergies, skin problems, and digestive disorders. One possible
          reason is the nutritional composition of many commercial dog foods, particularly the
          balance between protein, fat, and carbohydrates.
        </p>
        <p className="leading-relaxed">
          Understanding how dogs evolved to eat and how their digestive system works can help owners
          make better decisions about their pet’s diet.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Dog Biology and Digestive Physiology
        </h2>
        <p className="leading-relaxed">
          Dogs are considered facultative carnivores. This means they are capable of digesting some
          plant-based foods, but their digestive system is primarily adapted to process animal
          proteins and fats.
        </p>

        <div className="my-8 rounded-2xl border border-slate-800 bg-[#151c2b] p-6 md:p-8">
          <h4 className="mb-4 text-lg font-bold text-white">
            Key features of canine digestion include:
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Beaker className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6b00]" />
              <span>
                Highly acidic stomach (pH around 1–2) that efficiently breaks down proteins and
                kills harmful bacteria
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Activity className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6b00]" />
              <span>Relatively short digestive tract compared to herbivores</span>
            </li>
            <li className="flex items-start gap-3">
              <Beef className="mt-0.5 h-5 w-5 shrink-0 text-[#ff6b00]" />
              <span>Strong digestive enzymes for protein and fat metabolism</span>
            </li>
          </ul>
        </div>

        <p className="leading-relaxed">
          While dogs can digest some starch, their metabolism still functions best when the majority
          of calories come from animal-based nutrients.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Natural Diet vs Commercial Dog Food
        </h2>
        <p className="leading-relaxed">
          In a natural prey-based diet, such as what wild canids consume, the approximate energy
          distribution looks like this:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Protein:</strong> around 50–55% of calories
          </li>
          <li>
            <strong>Fat:</strong> around 40–45% of calories
          </li>
          <li>
            <strong>Carbohydrates:</strong> typically less than 10%
          </li>
        </ul>
        <p className="leading-relaxed">
          This composition supports muscle development, stable energy levels, and healthy metabolic
          function.
        </p>

        <p className="leading-relaxed mt-6">In contrast, many commercial dog foods contain:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Protein:</strong> 20–30%
          </li>
          <li>
            <strong>Fat:</strong> 10–25%
          </li>
          <li>
            <strong>Carbohydrates:</strong> often 35–50%
          </li>
        </ul>
        <p className="leading-relaxed">
          High levels of carbohydrates are often included because they are cheaper and easier to
          process during manufacturing. To understand how to feed a balanced diet instead, see our{' '}
          <Link
            href="/blog/dry-food-vs-raw-diet-bulldogs"
            className="text-[#ff6b00] hover:underline"
          >
            Raw Diet vs Kibble guide
          </Link>
          .
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Potential Effects of High-Carbohydrate Diets
        </h2>
        <p className="leading-relaxed">
          When dogs consume diets that are significantly higher in carbohydrates than their natural
          intake, several issues may develop over time.
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">Digestive changes</h3>
        <p className="leading-relaxed">
          Excess carbohydrates can alter the gut microbiome, encouraging bacteria that ferment
          carbohydrates instead of those that specialize in protein digestion.
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">Energy fluctuations</h3>
        <p className="leading-relaxed">
          High carbohydrate intake may cause spikes and drops in blood sugar, leading to unstable
          energy levels.
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">Skin and allergy issues</h3>
        <p className="leading-relaxed">
          Some studies suggest that certain carbohydrate sources, especially grains, may contribute
          to dermatological issues in susceptible dogs.
        </p>

        <h3 className="mt-8 text-xl font-bold text-white">Weight gain</h3>
        <p className="leading-relaxed">
          Excess carbohydrates can increase calorie intake and contribute to obesity when not
          balanced with sufficient activity.
        </p>
      </div>

      <div className="my-10 overflow-hidden rounded-2xl border-l-4 border-yellow-500 bg-yellow-500/10 p-6 md:p-8">
        <div className="flex gap-4">
          <AlertTriangle className="h-6 w-6 shrink-0 text-yellow-500" />
          <div>
            <h4 className="mb-2 text-base font-bold uppercase tracking-wider text-white">Advice</h4>
            <p className="text-sm italic leading-relaxed text-slate-300">
              If your dog shows symptoms such as chronic itching, digestive problems, low energy, or
              poor coat quality, consult a veterinarian. In many cases, dietary adjustments or
              limited-ingredient diets can significantly improve your dog’s condition.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Scientific Research
        </h2>
        <p className="leading-relaxed">
          Several veterinary studies have investigated the relationship between diet composition and
          canine health.
        </p>
        <ul className="space-y-4 list-disc pl-6">
          <li>
            <strong>Hewson-Hughes et al., 2011:</strong> Geometric analysis of macronutrient
            selection in dogs (Journal of Experimental Biology)
          </li>
          <li>
            <strong>Bosch et al., 2015:</strong> The nutrition of carnivorous animals: dogs and
            wolves (Animal Frontiers)
          </li>
          <li>
            <strong>BMC Veterinary Research, 2021:</strong> Limited-ingredient diets improving
            symptoms in dogs with food sensitivities.
          </li>
        </ul>
        <p className="leading-relaxed">
          These studies suggest that dogs naturally regulate their intake toward higher protein and
          fat ratios when given the option.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="mb-6 mt-12 border-b border-slate-800 pb-2 text-2xl font-bold text-white md:text-3xl">
          Practical Recommendations
        </h2>
        <p className="leading-relaxed">To support your dog’s health:</p>
        <ul className="space-y-3 list-disc pl-6">
          <li>Choose foods with higher protein content from quality animal sources</li>
          <li>Avoid excessive fillers such as corn, wheat, and soy</li>
          <li>Include fresh whole foods when possible, such as meat, eggs, or organs</li>
          <li>Monitor your dog’s skin condition, stool quality, and energy levels</li>
        </ul>
        <p className="leading-relaxed">
          Every dog is different, so dietary changes should be introduced gradually and adjusted
          based on the dog’s health and activity level. For more specifics, check out our{' '}
          <Link href="/faq" className="text-[#ff6b00] hover:underline">
            FAQ
          </Link>{' '}
          section.
        </p>
      </div>

      <div className="mt-16 border-t border-slate-800 pt-8">
        <h4 className="mb-4 text-lg font-bold text-white">Conclusion</h4>
        <p className="leading-relaxed">
          Commercial dog food is convenient, but not all formulas match the natural nutritional
          needs of dogs. Diets excessively high in carbohydrates may affect digestion, metabolism,
          and skin health.
        </p>
        <p className="leading-relaxed">
          Choosing foods that emphasize protein and healthy fats while limiting unnecessary
          carbohydrates can help support long-term health and vitality. See this philosophy in
          action by viewing our{' '}
          <Link href="/puppies" className="text-[#ff6b00] hover:underline">
            available puppies
          </Link>
          .
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
            href="/faq"
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#151c2b] p-4 text-sm font-medium text-slate-200 transition-all hover:border-[#ff6b00] hover:text-[#ff6b00]"
          >
            <span>FAQ on Diet</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
