import Link from 'next/link';
import { Home, PawPrint, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0d1a44] px-4 py-16 text-white selection:bg-[#ffb84d] selection:text-[#0d1a44]">
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <PawPrint className="absolute left-[10%] top-[20%] rotate-[-12deg] text-white" size={120} />
        <PawPrint
          className="absolute right-[15%] bottom-[15%] rotate-[24deg] text-white"
          size={180}
        />
        <PawPrint
          className="absolute left-[20%] bottom-[30%] rotate-[-45deg] text-white"
          size={60}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h1 className="select-none text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#ff4d79] to-[#ff7fa5] opacity-90 drop-shadow-[0_0_25px_rgba(255,77,121,0.4)] md:text-[12rem]">
          404
        </h1>

        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
          Oops! This pup ran off.
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
          We searched the whole kennel, but the page you were looking for is nowhere to be found. It
          may have moved or the link might be outdated.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-full bg-[#ffb84d] px-8 py-3.5 text-sm font-bold text-[#0d1a44] transition-all duration-300 hover:bg-[#ffc978] hover:shadow-[0_0_20px_rgba(255,184,77,0.4)]"
          >
            <Home size={18} />
            Back to home
          </Link>

          <Link
            href="/puppies"
            className="group flex items-center gap-2 rounded-full border border-slate-700 bg-transparent px-8 py-3.5 text-sm font-bold text-slate-300 transition-all duration-300 hover:border-[#ff4d79] hover:text-[#ff4d79]"
          >
            <Search size={18} className="transition-transform duration-300 group-hover:scale-110" />
            Find a puppy
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 text-sm text-slate-500">Exotic Bulldog Legacy</div>
    </div>
  );
}
