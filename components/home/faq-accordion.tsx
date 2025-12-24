'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  faqs: FaqItem[];
};

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = index === openIndex;
        const accordionId = `faq-accordion-${index}`;
        const buttonId = `${accordionId}-button`;
        const panelId = `${accordionId}-panel`;

        return (
          <div
            key={faq.question}
            className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
              isOpen
                ? 'bg-[#1E293B] border-orange-500/30'
                : 'bg-[#111827] border-slate-800 hover:border-slate-700'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="flex w-full items-center justify-between p-6 text-left"
              aria-expanded={isOpen}
              aria-controls={panelId}
              id={buttonId}
            >
              <p className={`text-lg font-semibold ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                {faq.question}
              </p>
              <ChevronDown
                className={`transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-orange-400' : 'text-slate-500'
                }`}
                aria-hidden="true"
              />
            </button>
            <div
              className={`px-6 pb-6 text-slate-400 leading-relaxed ${isOpen ? 'block' : 'hidden'}`}
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
            >
              {faq.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
