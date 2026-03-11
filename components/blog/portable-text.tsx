import Image from 'next/image';
import { PortableText, type PortableTextComponents } from 'next-sanity';
import type { PortableTextBlock } from '@portabletext/types';

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
    h2: ({ children }) => <h2 className="mb-6 mt-12 text-2xl font-bold text-white">{children}</h2>,
    blockquote: ({ children }) => (
      <blockquote className="my-8 rounded-r-xl border-l-4 border-[#ff6b00] bg-[#151c2b]/50 py-2 pl-6 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-8 list-disc space-y-3 pl-6 [&>li::marker]:text-[#ff6b00]">{children}</ul>
    ),
    number: ({ children }) => <ol className="mb-8 list-decimal space-y-3 pl-6">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="text-slate-300">{children}</li>,
    number: ({ children }) => <li className="text-slate-300">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
  types: {
    tipBox: ({ value }: { value: TipBoxValue }) => (
      <div className="my-10 rounded-2xl border border-slate-800 bg-[#151c2b] p-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b00] text-sm text-white">
            💡
          </span>
          {value.title ?? 'Совет'}
        </h3>
        {value.content && <p className="text-sm text-slate-300">{value.content}</p>}
      </div>
    ),
    image: ({ value }: { value: ImageValue }) => {
      const src = urlFor(value).width(900).url();
      return (
        <div className="my-8 overflow-hidden rounded-2xl">
          <Image
            src={src}
            alt={value.alt ?? ''}
            width={900}
            height={506}
            className="w-full object-cover"
          />
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
