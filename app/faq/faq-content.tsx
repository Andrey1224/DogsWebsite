// FAQ page client content with search and accordion
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, HelpCircle, MessageCircle, Mail } from 'lucide-react';

import { faqData } from './faq-data';

export function FaqContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategory, setOpenCategory] = useState(0);
  const [openItem, setOpenItem] = useState(0);

  // Filter logic
  const filteredData = faqData
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <>
      {/* --- Header & Search --- */}
      <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-32 md:px-12">
        <div className="pointer-events-none absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="relative z-10 mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/50 px-4 py-1.5">
            <HelpCircle size={14} className="text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Support Center
            </span>
          </div>
          <h1 className="mb-6 text-4xl font-bold md:text-6xl">How can we help you?</h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-400">
            Explore the breeding standards, reservation process, and go-home preparation steps that
            guide every Exotic Bulldog Legacy placement.
          </p>

          {/* Search Bar */}
          <div className="group relative mx-auto max-w-xl">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-500 to-purple-600 opacity-20 blur transition duration-500 group-hover:opacity-40" />
            <div className="relative flex items-center rounded-full border border-slate-700 bg-[#1E293B] shadow-2xl">
              <Search className="ml-4 text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search for 'deposit', 'delivery', 'diet'..."
                className="w-full border-none bg-transparent px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- FAQ Accordion --- */}
      <div className="mx-auto max-w-3xl px-6 pb-24 md:px-12">
        {filteredData.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No answers found for &quot;{searchTerm}&quot;. Try a different keyword.
          </div>
        ) : (
          <div className="space-y-12">
            {filteredData.map((cat, catIdx) => {
              const IconComponent = cat.icon;
              return (
                <div key={cat.category}>
                  {/* Category Title */}
                  {!searchTerm && (
                    <div className="mb-6 flex items-center gap-3 border-b border-slate-800 pb-2">
                      <IconComponent size={20} className={cat.iconColor} />
                      <h2 className="text-xl font-bold text-slate-200">{cat.category}</h2>
                    </div>
                  )}

                  <div className="space-y-4">
                    {cat.items.map((item, itemIdx) => {
                      const isOpen = openCategory === catIdx && openItem === itemIdx;

                      return (
                        <button
                          key={item.question}
                          type="button"
                          onClick={() => {
                            if (isOpen) {
                              setOpenItem(-1);
                            } else {
                              setOpenCategory(catIdx);
                              setOpenItem(itemIdx);
                            }
                          }}
                          className={`group w-full cursor-pointer overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                            isOpen
                              ? 'border-orange-500/50 bg-[#151e32] shadow-lg shadow-orange-500/5'
                              : 'border-slate-800 bg-[#111827] hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4 p-6">
                            <h3
                              className={`text-lg font-semibold leading-snug ${isOpen ? 'text-orange-400' : 'text-slate-200 group-hover:text-white'}`}
                            >
                              {item.question}
                            </h3>
                            <ChevronDown
                              className={`flex-shrink-0 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-orange-500' : ''}`}
                            />
                          </div>

                          <div
                            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                          >
                            <div className="overflow-hidden">
                              <div className="mt-2 border-t border-slate-700/50 px-6 pb-6 pt-4 leading-relaxed text-slate-400">
                                {item.answer}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- Contact Footer --- */}
      <div className="mx-auto max-w-4xl px-6 md:px-12">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-700/50 bg-gradient-to-r from-[#1E293B] to-[#1a2333] p-8 text-center md:p-12">
          {/* Decor */}
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-white/5 blur-3xl" />

          <h2 className="mb-4 text-2xl font-bold text-white">Still have questions?</h2>
          <p className="mx-auto mb-8 max-w-lg text-slate-400">
            We love connecting with future bulldog families. Contact us to schedule a kennel visit,
            video call, or to request health docs.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold !text-black transition-colors hover:bg-slate-200"
            >
              <MessageCircle size={18} className="!text-black" /> Chat with us
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-full border border-slate-600 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Mail size={18} /> Email Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
