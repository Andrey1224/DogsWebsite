"use client";

import { useState } from "react";

import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/puppies", label: "Available Puppies" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/policies", label: "Policies" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur">
      <div className="mx-auto max-w-5xl px-6 py-4">
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          <Link href="/" className="font-serif text-xl font-semibold tracking-tight">
            Exotic Bulldog Level
          </Link>
          <div className="hidden items-center gap-6 sm:flex">
            <nav>
              <ul className="flex items-center gap-6 text-sm font-medium text-muted">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="transition-colors hover:text-accent-aux"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={toggleMenu}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-text shadow-sm transition hover:bg-[color:var(--hover)] sm:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="site-header-menu"
          >
            <span>Menu</span>
            <span aria-hidden="true" className="inline-block">
              {isMenuOpen ? "–" : "≡"}
            </span>
          </button>
        </div>
        {isMenuOpen ? (
          <div
            id="site-header-menu"
            className="mt-4 flex flex-col gap-4 rounded-xl border border-border bg-card/95 p-4 shadow-lg sm:hidden"
          >
            <nav>
              <ul className="flex flex-col gap-3 text-sm font-semibold text-text">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="transition-colors hover:text-accent-aux"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <ThemeToggle />
          </div>
        ) : null}
      </div>
    </header>
  );
}
