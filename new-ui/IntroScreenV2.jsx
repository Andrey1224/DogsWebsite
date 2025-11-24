import React, { useState, useEffect, useRef } from 'react';
import { PawPrint, ChevronRight, Sparkles, ArrowRight, Home, User, Settings } from 'lucide-react';

// --- YOUR INTRO SCREEN COMPONENT ---
function IntroScreen({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: '50%', y: '50%' });

  // Состояние слайдера
  const [dragWidth, setDragWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef(null);

  // Логика движения мыши для эффекта "Фонарик"
  const handleMouseMoveGlobal = (e) => {
    // Обновляем позицию для маски
    // Используем clientX/Y напрямую для CSS переменных
    const x = e.clientX;
    const y = e.clientY;
    setMousePos({ x, y });

    // Если тянем слайдер, обновляем его тоже
    if (isDragging) handleSliderMove(x);
  };

  const handleTouchMoveGlobal = (e) => {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    setMousePos({ x, y });
    if (isDragging) handleSliderMove(x);
  };

  // --- Логика Слайдера ---
  const handleSliderStart = (clientX) => {
    setIsDragging(true);
    handleSliderMove(clientX);
  };

  const handleSliderMove = (clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const knobWidth = 72;
    const maxDrag = rect.width - knobWidth;
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
    setTimeout(onComplete, 1000);
  };

  if (isExiting && !onComplete) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] bg-black text-white font-sans overflow-hidden flex flex-col items-center justify-center cursor-none
        transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]
        ${isExiting ? 'opacity-0 scale-110 pointer-events-none blur-xl' : 'opacity-100'}
      `}
      onMouseMove={handleMouseMoveGlobal}
      onMouseUp={handleSliderEnd}
      onTouchMove={handleTouchMoveGlobal}
      onTouchEnd={handleSliderEnd}
    >
      {/* --- СЛОЙ 1: ЯРКОЕ ФОТО (Нижний слой) --- 
        Это то, что мы увидим "внутри" кругов.
      */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80"
          className="w-full h-full object-cover scale-105 animate-slowPan filter brightness-110 contrast-125"
          alt="Puppy Hidden"
        />
      </div>

      {/* --- СЛОЙ 2: ТЕМНАЯ МАСКА (Верхний слой) --- 
        Это темная "шторка", в которой мы прорезаем дырки.
        Используем CSS mask-image для создания прозрачных областей.
      */}
      <div
        className="absolute inset-0 z-10 bg-black transition-all duration-75 ease-linear"
        style={{
          // Магия здесь: создаем маску из нескольких градиентов
          // 1. Курсор (фонарик)
          // 2. Рандомные пульсирующие круги (анимация через CSS)
          maskImage: `
            radial-gradient(circle 150px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 100%),
            radial-gradient(circle 80px at 20% 30%, transparent 0%, black 100%),
            radial-gradient(circle 60px at 80% 70%, transparent 0%, black 100%)
          `,
          WebkitMaskImage: `
            radial-gradient(circle 180px at ${mousePos.x}px ${mousePos.y}px, transparent 20%, black 100%)
          `,
          // Инвертируем логику для WebkitMaskImage: прозрачное = видно нижний слой (яркий), черное = видно этот слой (черный)
          // Но проще сделать наоборот: этот слой - ЧЕРНЫЙ ЦВЕТ.
          // mask-image делает этот черный слой ПРОЗРАЧНЫМ в местах градиента.
        }}
      >
        {/* На самом деле, CSS mask работает так: 
           Черный цвет в маске = видимый элемент. Прозрачный = невидимый.
           Нам нужно наоборот: скрыть черный слой там, где курсор.
           Поэтому используем mask-composite (сложно) или просто
           Сделаем этот слой ПОЛУПРОЗРАЧНЫМ ЧЕРНЫМ ОВЕРЛЕЕМ, а "дырку" сделаем через background: radial-gradient
         */}
      </div>

      {/* ПЕРЕОСМЫСЛЕНИЕ ПОДХОДА ДЛЯ ЛУЧШЕЙ ПРОИЗВОДИТЕЛЬНОСТИ 
         Вместо mask-image (который может лагать), используем простой DIV с огромным radial-gradient фоном.
      */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(0,0,0,0.95) 100%)`,
        }}
      >
        {/* Дополнительные "рандомные" круги сделаем отдельными дивами с анимацией */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-transparent rounded-full shadow-[0_0_100px_100px_rgba(0,0,0,0)_inset] animate-randomReveal1"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-transparent rounded-full shadow-[0_0_80px_80px_rgba(0,0,0,0)_inset] animate-randomReveal2"></div>
      </div>

      {/* --- Слой контента (Поверх всего) --- */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-md w-full">
        {/* Логотип */}
        <div className="w-24 h-24 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-[0_0_50px_rgba(249,115,22,0.2)] animate-float">
          <PawPrint size={40} className="text-orange-400 drop-shadow-lg" />
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-3 drop-shadow-2xl text-white">
          Welcome Home
        </h1>
        <p className="text-slate-200 text-base mb-12 leading-relaxed font-medium drop-shadow-md">
          Reveal the legacy in the dark. <br /> Slide below to enter.
        </p>

        {/* --- Слайдер --- */}
        <div
          ref={trackRef}
          className="relative w-full h-20 bg-black/40 backdrop-blur-md rounded-full border-2 border-white/10 overflow-hidden cursor-pointer group select-none shadow-2xl"
          onMouseDown={(e) => handleSliderStart(e.clientX)}
          onTouchStart={(e) => handleSliderStart(e.touches[0].clientX)}
        >
          {/* Текст */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-100'}`}
          >
            <span className="text-sm font-bold uppercase tracking-[0.25em] text-white/50 animate-pulse">
              Slide to Unlock
            </span>
            <ChevronRight className="ml-2 text-white/50 animate-pulse" size={18} />
          </div>

          {/* Кнопка */}
          <div
            className="absolute top-2 bottom-2 w-16 bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-75 ease-linear z-10"
            style={{ left: `${dragWidth + 4}px` }}
          >
            {dragWidth > (trackRef.current?.offsetWidth || 0) * 0.85 ? (
              <Sparkles className="text-orange-500 animate-spin" size={24} />
            ) : (
              <ArrowRight className="text-black" size={24} />
            )}
          </div>
        </div>
      </div>

      {/* --- Кастомный Курсор (Фонарик) --- */}
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
        
        /* Анимация "Случайных дырок" */
        /* Мы эмулируем открытие дырок, меняя маску или просто добавляя светлые пятна */
        @keyframes randomReveal {
            0%, 100% { opacity: 0; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
        }

        .animate-slowPan { animation: slowPan 20s ease-in-out infinite; }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// --- DUMMY HOME COMPONENT FOR DEMONSTRATION ---
const HomeScreen = ({ onReset }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-orange-600 font-bold text-xl">
          <PawPrint />
          <span>DoggoLegacy</span>
        </div>
        <div className="flex space-x-4 text-slate-400">
          <Home className="w-6 h-6 text-slate-800" />
          <User className="w-6 h-6 hover:text-slate-800 cursor-pointer" />
          <Settings className="w-6 h-6 hover:text-slate-800 cursor-pointer" />
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in-up">
          <div className="w-full h-64 bg-orange-100 rounded-3xl flex items-center justify-center mb-6">
            <img
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              className="w-full h-full object-cover rounded-3xl shadow-lg"
              alt="Dog"
            />
          </div>
          <h2 className="text-4xl font-bold text-slate-800">You're Inside!</h2>
          <p className="text-slate-600 text-lg">
            The secret handshake worked. Welcome to the exclusive member area.
          </p>
          <button
            onClick={onReset}
            className="px-8 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-1 transform duration-200"
          >
            Lock Screen Again
          </button>
        </div>
      </main>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro ? (
        <IntroScreen onComplete={() => setShowIntro(false)} />
      ) : (
        <HomeScreen onReset={() => setShowIntro(true)} />
      )}
    </>
  );
}
