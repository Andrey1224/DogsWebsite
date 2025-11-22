import Link from 'next/link';
import { PawPrint } from 'lucide-react';
import { CONTACT_DETAILS } from '@/lib/config/contact';
import { LoginForm } from './login-form';

export default function AdminLoginPage() {
  const supportEmail = CONTACT_DETAILS.email.address;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B1120] px-6 py-10 text-white">
      <div className="pointer-events-none absolute -left-10 top-10 h-80 w-80 rounded-full bg-orange-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-80 w-80 rounded-full bg-purple-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center">
          <Link
            href="/"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1120]"
          >
            <div className="mb-4 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 shadow-lg shadow-orange-500/10">
              <PawPrint className="text-orange-500" size={32} />
            </div>
          </Link>
          <div className="text-xl font-bold tracking-tight text-white">
            Exotic <span className="font-light text-slate-400">Bulldog Legacy</span>
          </div>
        </div>

        <LoginForm supportEmail={supportEmail} />

        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-slate-600">
          &copy; 2025 Exotic Bulldog Legacy. Secure Access.
        </p>
      </div>
    </div>
  );
}
