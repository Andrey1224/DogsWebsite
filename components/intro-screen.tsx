// Fullscreen intro overlay with slider unlock (IntroScreenV2)
'use client';

import { useRef, useState } from 'react';
import { ArrowRight, ChevronRight, PawPrint, Sparkles } from 'lucide-react';

type IntroScreenProps = {
  onComplete: () => void;
};

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number | string; y: number | string }>({
    x: '50%',
    y: '50%',
  });
  const [dragWidth, setDragWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMoveGlobal = (clientX: number, clientY: number) => {
    setMousePos({ x: clientX, y: clientY });
    if (isDragging) handleSliderMove(clientX);
  };

  const handleSliderStart = (clientX: number) => {
    setIsDragging(true);
    handleSliderMove(clientX);
  };

  const handleSliderMove = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const knobWidth = 72;
    const maxDrag = rect.width - knobWidth;
    const offsetX = clientX - rect.left;
    const newWidth = Math.max(0, Math.min(offsetX, maxDrag));
    setDragWidth(newWidth);
  };

  const handleSliderEnd = () => {
    if (!isDragging || !trackRef.current) return;
    setIsDragging(false);
    const trackWidth = trackRef.current.offsetWidth;
    const knobWidth = 72;
    const maxDrag = trackWidth - knobWidth;
    if (dragWidth > maxDrag * 0.9) {
      setDragWidth(maxDrag);
      completeIntro();
    } else {
      setDragWidth(0);
    }
  };

  const completeIntro = () => {
    setIsExiting(true);
    try {
      sessionStorage.setItem('ebl_intro_complete', 'true');
      localStorage.setItem('ebl_intro_seen', 'true');
    } catch {
      // ignore
    }
    setTimeout(onComplete, 1000);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex cursor-none flex-col items-center justify-center overflow-hidden bg-black text-white font-sans transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        isExiting ? 'opacity-0 scale-110 pointer-events-none blur-xl' : 'opacity-100'
      }`}
      onMouseMove={(e) => handleMouseMoveGlobal(e.clientX, e.clientY)}
      onMouseUp={handleSliderEnd}
      onTouchMove={(e) => handleMouseMoveGlobal(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleSliderEnd}
    >
      {/* Background (bright image) */}
      <div className="absolute inset-0 z-0">
        {/* Use native img to avoid remote host config; this is a cinematic backdrop */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80"
          alt="Puppy Hidden"
          className="h-full w-full scale-105 object-cover animate-slowPanV2 filter brightness-110 contrast-125"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Dark mask with spotlight */}
      <div
        className="absolute inset-0 z-10 bg-black transition-all duration-75 ease-linear pointer-events-none"
        style={{
          maskImage: `
            radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 100%),
            radial-gradient(circle 80px at 20% 30%, transparent 0%, black 100%),
            radial-gradient(circle 60px at 80% 70%, transparent 0%, black 100%)
          `,
          WebkitMaskImage: `
            radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, transparent 20%, black 100%)
          `,
        }}
      />

      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(0,0,0,0.95) 100%)`,
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-transparent rounded-full shadow-[0_0_100px_100px_rgba(0,0,0,0)_inset] animate-randomReveal1" />
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-transparent rounded-full shadow-[0_0_80px_80px_rgba(0,0,0,0)_inset] animate-randomReveal2" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-md w-full">
        <div className="w-24 h-24 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_50px_rgba(249,115,22,0.2)] animate-floatV2">
          <PawPrint size={40} className="text-orange-400 drop-shadow-lg" />
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-3 drop-shadow-2xl text-white">
          Welcome Home
        </h1>
        <p className="text-slate-200 text-base leading-relaxed font-medium drop-shadow-md">
          “Happiness can be found, even in the darkest of times, if one only remembers to turn on
          the light.”
        </p>
        <p className="text-slate-400 text-sm mb-12 leading-relaxed font-medium drop-shadow-md">
          — Albus Dumbledore (Harry Potter)
        </p>

        <div
          ref={trackRef}
          className="relative w-full h-20 bg-black/40 backdrop-blur-md rounded-full border-2 border-white/10 overflow-hidden cursor-pointer group select-none shadow-2xl"
          onMouseDown={(e) => handleSliderStart(e.clientX)}
          onTouchStart={(e) => handleSliderStart(e.touches[0].clientX)}
        >
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isDragging ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <span className="text-sm font-bold uppercase tracking-[0.25em] text-white/50 animate-pulse">
              Slide to Unlock
            </span>
            <ChevronRight className="ml-2 text-white/50 animate-pulse" size={18} />
          </div>

          <div
            className="absolute top-2 bottom-2 w-16 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-75 ease-linear z-10"
            style={{ left: `${dragWidth + 4}px` }}
          >
            {trackRef.current && dragWidth > (trackRef.current.offsetWidth - 72) * 0.85 ? (
              <Sparkles className="text-orange-500 animate-spin" size={24} />
            ) : (
              <ArrowRight className="text-black" size={24} />
            )}
          </div>
        </div>
      </div>

      {/* Custom cursor */}
      <div
        className="fixed top-0 left-0 w-8 h-8 border-2 border-white/30 rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{ left: mousePos.x, top: mousePos.y }}
      />

      <style>{`
        @keyframes slowPan {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes randomReveal {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-slowPanV2 { animation: slowPan 20s ease-in-out infinite; }
        .animate-floatV2 { animation: float 6s ease-in-out infinite; }
        .animate-randomReveal1 { animation: randomReveal 6s ease-in-out infinite; }
        .animate-randomReveal2 { animation: randomReveal 7.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
