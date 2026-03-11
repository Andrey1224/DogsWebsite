'use client';

import { useState } from 'react';
import { Facebook, Twitter, Link as LinkIcon } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://exoticbulldog.dev';

type ShareButtonsProps = {
  slug: string;
};

export function ShareButtons({ slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `${BASE_URL}/blog/${slug}`;

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;

  const btnClass =
    'w-10 h-10 rounded-full bg-[#151c2b] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#ff6b00] transition-colors';

  return (
    <>
      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Share</span>
      <a href={fbUrl} target="_blank" rel="noopener noreferrer" className={btnClass}>
        <Facebook size={18} />
      </a>
      <a href={twUrl} target="_blank" rel="noopener noreferrer" className={btnClass}>
        <Twitter size={18} />
      </a>
      <button
        onClick={handleCopy}
        className={`${btnClass} relative`}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        <LinkIcon size={18} />
        {copied && (
          <span className="absolute -right-20 whitespace-nowrap rounded bg-[#151c2b] px-2 py-1 text-xs text-white shadow">
            Copied!
          </span>
        )}
      </button>
    </>
  );
}
