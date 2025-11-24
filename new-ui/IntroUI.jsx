import React, { useState, useEffect } from 'react';
import { PawPrint, ArrowRight } from 'lucide-react';

export default function IntroScreen({ onComplete }) {
  const [step, setStep] = useState(0); // 0: Init, 1: Reveal, 2: Text, 3: Exit
  const [textIndex, setTextIndex] = useState(0);

  const phrases = [
    'Excellence in every gene.',
    'Raised with southern warmth.',
    'Your perfect companion awaits.',
  ];

  useEffect(() => {
    // Таймлайн анимации
    const t1 = setTimeout(() => setStep(1), 500); // Логотип появляется
    const t2 = setTimeout(() => setStep(2), 2500); // Фон разгорается

    // Смена текста
    const textInterval = setInterval(() => {
      if (step === 2) {
        setTextIndex((prev) => (prev + 1) % phrases.length);
      }
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(textInterval);
    };
  }, [step]);

  const handleEnter = () => {
    setStep(3); // Запуск анимации выхода
    sessionStorage.setItem('ebl_intro_complete', 'true');
    setTimeout(onComplete, 1200); // Ждем завершения анимации (чуть дольше для плавности)
  };

  if (step === 4) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-black text-white font-sans
        transition-all duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)]
        ${step === 3 ? 'opacity-0 scale-110 pointer-events-none blur-xl' : 'opacity-100'}
      `}
    >
      {/* Встроенные стили для кастомных анимаций */}
      <style>{`
        @keyframes slowPan {
          0% { transform: scale(1.1); }
          100% { transform: scale(1.0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-slowPan { animation: slowPan 10s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* --- Background Video/Image Layer --- */}
      <div
        className={`absolute inset-0 transition-opacity duration-[3000ms] ease-out ${step >= 2 ? 'opacity-50' : 'opacity-0'}`}
      >
        <img
          src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80"
          className="w-full h-full object-cover animate-slowPan"
          alt="Atmosphere"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/90" />
      </div>

      {/* --- Content Layer --- */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Logo Animation */}
        <div
          className={`
            mb-12 transition-all duration-[1500ms] transform
            ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          `}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_80px_-20px_rgba(249,115,22,0.5)] animate-float">
            <PawPrint size={48} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 leading-tight">
            Exotic Bulldog <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">
              Legacy
            </span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-xs font-bold tracking-[0.3em] text-slate-500 uppercase">
            <span className="w-12 h-[1px] bg-slate-800"></span>
            Est. 1999
            <span className="w-12 h-[1px] bg-slate-800"></span>
          </div>
        </div>

        {/* Changing Text Phrases */}
        <div
          className={`h-20 flex items-center justify-center transition-all duration-1000 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <p
            key={textIndex}
            className="text-xl md:text-2xl text-slate-300 font-light italic animate-[fadeIn_1s_ease-out]"
          >
            "{phrases[textIndex]}"
          </p>
        </div>

        {/* Enter Button */}
        <div
          className={`
            mt-12 transition-all duration-1000 delay-500
            ${step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
          `}
        >
          <button
            onClick={handleEnter}
            className="group relative px-10 py-5 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95"
          >
            {/* Button Glow Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-500/20 to-purple-600/20 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
            <div className="absolute inset-0 w-full h-full border border-white/10 rounded-full group-hover:border-orange-500/50 transition-colors duration-500" />

            <span className="relative flex items-center gap-4 font-bold tracking-[0.15em] uppercase text-sm text-white group-hover:text-orange-100 transition-colors">
              Enter The Legacy
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Status */}
      <div
        className={`absolute bottom-10 text-slate-700 text-[10px] tracking-[0.2em] uppercase transition-opacity duration-1000 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}
      >
        Experience Loading...
      </div>
    </div>
  );
}
