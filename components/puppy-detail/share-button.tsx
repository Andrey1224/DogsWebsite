'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

type ShareButtonProps = {
  title: string;
  url: string;
};

export function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch (error) {
        // User cancelled or share failed, fallback to clipboard
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20"
      aria-label={copied ? 'Link copied!' : 'Share puppy'}
      title={copied ? 'Link copied!' : 'Share puppy'}
    >
      {copied ? <Check size={20} /> : <Share2 size={20} />}
    </button>
  );
}
