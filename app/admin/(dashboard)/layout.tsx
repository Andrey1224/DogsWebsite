import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AdminToaster } from '@/components/admin-toaster';
import { AdminDashboardShell } from '@/components/admin/dashboard-shell';
import { getAdminSession } from '@/lib/admin/session';

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <>
      <AdminDashboardShell email={session.sub}>{children}</AdminDashboardShell>
      <AdminToaster />
    </>
  );
}
