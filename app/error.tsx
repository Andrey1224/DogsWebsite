'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, PawPrint, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0d1a44] px-4 py-16 text-white selection:bg-[#ffb84d] selection:text-[#0d1a44]">
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <PawPrint className="absolute left-[5%] top-[10%] rotate-[120deg] text-white" size={140} />
        <PawPrint className="absolute right-[10%] top-[40%] rotate-[-60deg] text-white" size={90} />
        <PawPrint
          className="absolute left-[30%] bottom-[10%] rotate-[15deg] text-white"
          size={160}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <div className="relative inline-block">
          <h1 className="select-none text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#ff4d79] to-[#ff7fa5] opacity-90 drop-shadow-[0_0_30px_rgba(255,77,121,0.3)] md:text-[12rem]">
            500
          </h1>
          <AlertTriangle
            className="absolute -right-8 top-8 animate-pulse text-[#ffb84d] opacity-80"
            size={48}
          />
        </div>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Oops! Something went wrong.
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
          Looks like our servers overheated for a moment. This is not your fault. We are already on
          it.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="group flex items-center gap-2 rounded-full bg-[#ffb84d] px-8 py-3.5 text-sm font-bold text-[#0d1a44] transition-all duration-300 hover:bg-[#ffc978] hover:shadow-[0_0_20px_rgba(255,184,77,0.4)]"
          >
            <RefreshCcw
              size={18}
              className="transition-transform duration-500 group-hover:rotate-180"
            />
            Try again
          </button>

          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full border border-slate-700 bg-transparent px-8 py-3.5 text-sm font-bold text-slate-300 transition-all duration-300 hover:border-[#ff4d79] hover:text-[#ff4d79]"
          >
            <Home size={18} />
            Go home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 max-h-32 w-full max-w-full overflow-auto rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-left text-xs font-mono text-red-200">
            <p className="mb-1 font-bold">Error Log:</p>
            {error.message || 'Unknown error occurred'}
          </div>
        )}
      </div>

      <div className="absolute bottom-8 text-sm text-slate-500">Exotic Bulldog Legacy System</div>
    </div>
  );
}
