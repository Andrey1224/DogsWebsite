// New dark navigation UI - scroll-aware with fullscreen mobile menu
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, PawPrint, ChevronRight } from 'lucide-react';

const navLinks = [
  { name: 'Available Puppies', href: '/puppies' },
  { name: 'Reviews', href: '/reviews' },
  { name: 'FAQ', href: '/faq' },
  { name: 'About', href: '/about' },
  { name: 'Policies', href: '/policies' },
  { name: 'Contact', href: '/contact' },
];

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          fixed left-0 top-0 z-50 w-full transition-all duration-300
          ${
            isScrolled
              ? 'border-b border-slate-800/50 bg-[#0B1120]/80 py-4 shadow-lg shadow-black/20 backdrop-blur-xl'
              : 'bg-transparent py-6'
          }
        `}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
          {/* Logo Area */}
          <Link href="/" className="group flex cursor-pointer items-center gap-2">
            <div className="rounded-xl bg-orange-500/10 p-2 transition-colors duration-300 group-hover:bg-orange-500">
              <PawPrint className="text-orange-500 group-hover:text-white" size={24} />
            </div>
            <div className="text-xl font-bold tracking-tight text-white">
              Exotic <span className="font-light text-slate-400">Bulldog Legacy</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="group relative text-sm font-medium text-slate-300 transition-colors hover:text-orange-400 hover:text-white"
              >
                {link.name}
                {/* Hover Underline Animation */}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* CTA Button */}
            <Link
              href="/puppies"
              className="flex items-center gap-2 rounded-full border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-bold text-slate-300 transition-all hover:border-orange-500 hover:text-orange-400"
            >
              Find a Puppy <ChevronRight size={16} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 text-white lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Open navigation menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`
          fixed inset-0 z-[60] bg-[#0B1120] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div className="text-xl font-bold text-white">Menu</div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-full bg-[#1E293B] p-2 text-slate-400 hover:text-white"
            aria-label="Close navigation menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile Links */}
        <nav className="flex flex-col gap-6 p-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group flex items-center justify-between text-2xl font-bold text-slate-300 transition-colors hover:text-orange-500"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
              <ChevronRight
                className="translate-x-0 text-orange-500 opacity-0 transition-all duration-300 group-hover:-translate-x-4 group-hover:opacity-100"
                size={24}
              />
            </Link>
          ))}
        </nav>

        {/* Mobile Footer Actions */}
        <div className="absolute bottom-0 left-0 w-full border-t border-slate-800 bg-[#0f1629] p-8">
          <Link
            href="/puppies"
            className="mb-4 block w-full rounded-xl border border-slate-700 bg-transparent py-4 text-center text-lg font-bold text-slate-300 transition-all hover:border-orange-500 hover:text-orange-400"
            onClick={() => setMobileMenuOpen(false)}
          >
            Find Available Puppies
          </Link>
        </div>
      </div>
    </>
  );
}
