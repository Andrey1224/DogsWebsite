import Image from 'next/image';
import { PortableText, type PortableTextComponents } from 'next-sanity';
import type { PortableTextBlock } from '@portabletext/types';
import { Quote, Lightbulb } from 'lucide-react';

import { urlFor } from '@/sanity/lib/image';

type TipBoxValue = {
  _type: 'tipBox';
  title?: string;
  content?: string;
};

type ImageValue = {
  _type: 'image';
  asset: { _ref: string };
  alt?: string;
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-6 leading-relaxed text-slate-300">{children}</p>,
    lead: ({ children }) => (
      <p className="mb-8 text-xl font-medium leading-relaxed text-slate-200">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-6 mt-12 text-2xl font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
        {children}
      </h2>
    ),
    blockquote: ({ children }) => (
      <div className="my-8 rounded-r-2xl border-l-4 border-[#ff6b00] bg-gradient-to-r from-[#151c2b]/60 to-[#0b101a]/30 p-6 relative overflow-hidden">
        <Quote className="absolute -right-2 -top-2 h-16 w-16 text-[#ff6b00]/5 pointer-events-none transform rotate-180" />
        <blockquote className="relative z-10 italic text-slate-200 text-base md:text-lg leading-relaxed">
          {children}
        </blockquote>
      </div>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mb-8 space-y-3 pl-2 list-none">{children}</ul>,
    number: ({ children }) => <ol className="mb-8 list-decimal space-y-3 pl-6">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="text-slate-300 leading-relaxed flex items-start gap-2.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ff6b00] mt-2.5 shrink-0"></span>
        <span>{children}</span>
      </li>
    ),
    number: ({ children }) => <li className="text-slate-300">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
  types: {
    tipBox: ({ value }: { value: TipBoxValue }) => (
      <div className="my-10 rounded-2xl border border-slate-800 bg-gradient-to-br from-[#151c2b] to-[#121824] p-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 bg-[#ff6b00]/5 blur-[60px] rounded-full"></div>
        <h3 className="mb-4 flex items-center gap-3 text-lg font-bold text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/25">
            <Lightbulb size={20} className="animate-pulse" />
          </span>
          {value.title ?? 'Advice'}
        </h3>
        {value.content && <p className="text-sm text-slate-300 leading-relaxed">{value.content}</p>}
      </div>
    ),
    image: ({ value }: { value: ImageValue }) => {
      const src = urlFor(value).width(900).url();
      return (
        <div className="my-8">
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <Image
              src={src}
              alt={value.alt ?? ''}
              width={900}
              height={506}
              className="w-full object-cover"
            />
          </div>
          {value.alt && (
            <p className="mt-2 text-center text-xs text-slate-500 italic">{value.alt}</p>
          )}
        </div>
      );
    },
  },
};

type Props = {
  value: PortableTextBlock[];
};

export function BlogPortableText({ value }: Props) {
  return <PortableText value={value} components={components} />;
}
