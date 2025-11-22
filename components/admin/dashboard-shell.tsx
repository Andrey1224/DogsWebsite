'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { LogOut, MessageSquare, PawPrint } from 'lucide-react';
import { signOut } from '@/app/admin/actions';

type AdminDashboardShellProps = {
  email: string;
  children: ReactNode;
};

const navItems = [
  { href: '/admin/puppies', label: 'Puppies', icon: PawPrint },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
];

export function AdminDashboardShell({ email, children }: AdminDashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0B1120] text-white md:flex-row">
      {/* Background effects */}
      <div className="pointer-events-none absolute left-1/4 top-0 h-80 w-80 rounded-full bg-orange-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/5 bottom-0 h-80 w-80 rounded-full bg-purple-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

      {/* Sidebar */}
      <aside className="relative z-10 w-full flex-shrink-0 border-b border-slate-800/50 bg-[#111827]/50 md:h-auto md:w-64 md:border-b-0 md:border-r md:border-slate-800/50">
        <div className="flex items-center gap-3 border-b border-slate-800/50 px-6 py-6">
          <div className="rounded-lg bg-orange-500/10 p-2">
            <PawPrint className="text-orange-500" size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-white">EBL Dashboard</div>
            <div className="text-[11px] text-slate-500">{email}</div>
          </div>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== '/admin' && pathname.startsWith(href)) ||
              (href === '/admin/puppies' && pathname === '/admin');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? 'border border-orange-500/20 bg-orange-500/10 text-orange-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-y-auto">
        <div className="pointer-events-none absolute left-1/5 top-0 h-96 w-96 rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10 md:px-10">{children}</div>
      </main>
    </div>
  );
}
