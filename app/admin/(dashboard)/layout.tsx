import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AdminToaster } from '@/components/admin-toaster';
import { signOut } from '@/app/admin/actions';
import { getAdminSession } from '@/lib/admin/session';

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">EBL Admin</p>
            <h1 className="text-xl font-semibold text-text">Puppies Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted">Signed in as {session.sub}</p>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-hover"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {children}
        </section>
      </div>
      <AdminToaster />
    </div>
  );
}
