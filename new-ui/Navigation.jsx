import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun, PawPrint, ChevronRight } from 'lucide-react';

const navLinks = [
  { name: 'Available Puppies', href: '#' },
  { name: 'Reviews', href: '#' },
  { name: 'FAQ', href: '#' },
  { name: 'About', href: '#' },
  { name: 'Policies', href: '#' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true); // Mock theme state

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`
          fixed top-0 left-0 w-full z-50 transition-all duration-300
          ${
            isScrolled
              ? 'bg-[#0B1120]/80 backdrop-blur-xl border-b border-slate-800/50 py-4 shadow-lg shadow-black/20'
              : 'bg-transparent py-6'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-orange-500/10 p-2 rounded-xl group-hover:bg-orange-500 transition-colors duration-300">
              <PawPrint className="text-orange-500 group-hover:text-white" size={24} />
            </div>
            <div className="font-bold text-xl tracking-tight text-white">
              Exotic <span className="text-slate-400 font-light">Bulldog Legacy</span>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-white hover:text-orange-400 transition-colors relative group"
              >
                {link.name}
                {/* Hover Underline Animation */}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Theme Toggle Mockup */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-[#1E293B] border border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              {isDark ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* CTA Button */}
            <button className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-white/5 hover:shadow-orange-500/20 flex items-center gap-2">
              Find a Puppy <ChevronRight size={16} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 text-white" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`
          fixed inset-0 z-[60] bg-[#0B1120] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Mobile Header */}
        <div className="p-6 flex justify-between items-center border-b border-slate-800">
          <div className="font-bold text-xl text-white">Menu</div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 bg-[#1E293B] rounded-full text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile Links */}
        <div className="p-8 flex flex-col gap-6">
          {navLinks.map((link, idx) => (
            <a
              key={link.name}
              href={link.href}
              className="text-2xl font-bold text-slate-300 hover:text-orange-500 transition-colors flex items-center justify-between group"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
              <ArrowRightSimple className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-orange-500" />
            </a>
          ))}
        </div>

        {/* Mobile Footer Actions */}
        <div className="absolute bottom-0 left-0 w-full p-8 border-t border-slate-800 bg-[#0f1629]">
          <button className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/20 mb-4">
            Find Available Puppies
          </button>
          <div className="flex justify-center gap-6 text-slate-500">
            <span>Theme: Dark</span>
          </div>
        </div>
      </div>
    </>
  );
}

// Simple Icon helper for mobile menu arrow
const ArrowRightSimple = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
