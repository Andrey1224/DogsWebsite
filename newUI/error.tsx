'use client'; // Обязательно для обработки ошибок в Next.js

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useEffect } from 'react';
import { PawPrint, RefreshCcw, Home, AlertTriangle } from 'lucide-react';

// [ВАЖНО]
// В реальном проекте: import Link from 'next/link';
// Удалите этот временный Link:
type LinkProps = ComponentPropsWithoutRef<'a'> & { href: string; children: ReactNode };

const Link = ({ href, children, className, ...props }: LinkProps) => (
  <a href={href} className={className} {...props}>
    {children}
  </a>
);

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Здесь можно отправить лог ошибки в Sentry или другой сервис
    console.error('Application Error:', error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0d1a44] px-4 font-[family-name:var(--font-geist-sans)] text-white selection:bg-[#ffb84d] selection:text-[#0d1a44]">
      {/* Background Decor: Немного хаотичные следы, символизирующие сбой */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <PawPrint className="absolute left-[5%] top-[10%] rotate-[120deg] text-white" size={140} />
        <PawPrint className="absolute right-[10%] top-[40%] rotate-[-60deg] text-white" size={90} />
        <PawPrint
          className="absolute left-[30%] bottom-[10%] rotate-[15deg] text-white"
          size={160}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* Error Code with Warning Icon */}
        <div className="relative inline-block">
          <h1 className="select-none text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#ff4d79] to-[#ff7fa5] opacity-90 drop-shadow-[0_0_30px_rgba(255,77,121,0.3)] md:text-[12rem]">
            500
          </h1>
          <AlertTriangle
            className="absolute -right-8 top-8 animate-pulse text-[#ffb84d] opacity-80"
            size={48}
          />
        </div>

        {/* Headline */}
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Oops! Something went wrong.
        </h2>

        {/* Friendly Description */}
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
          Looks like our servers overheated for a moment. This is not your fault. We are already on
          it.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Primary Action: Try Again (Reset) */}
          <button
            onClick={() => reset()}
            className="group flex items-center gap-2 rounded-full bg-[#ffb84d] px-8 py-3.5 text-sm font-bold text-[#0d1a44] transition-all duration-300 hover:bg-[#ffc978] hover:shadow-[0_0_20px_rgba(255,184,77,0.4)]"
          >
            <RefreshCcw
              size={18}
              className="transition-transform duration-500 group-hover:rotate-180"
            />
            Try again
          </button>

          {/* Secondary Action: Go Home */}
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full border border-slate-700 bg-transparent px-8 py-3.5 text-sm font-bold text-slate-300 transition-all duration-300 hover:border-[#ff4d79] hover:text-[#ff4d79]"
          >
            <Home size={18} />
            Go home
          </Link>
        </div>

        {/* Error Details (Optional - good for dev mode, maybe hide in prod) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-left text-xs font-mono text-red-200 overflow-auto max-w-full max-h-32">
            <p className="font-bold mb-1">Error Log:</p>
            {error.message || 'Unknown error occurred'}
          </div>
        )}
      </div>

      <div className="absolute bottom-8 text-sm text-slate-500">Exotic Bulldog Legacy System</div>
    </main>
  );
}
