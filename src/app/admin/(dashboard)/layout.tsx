import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/middleware';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Verify Authentication
  let admin;
  try {
    admin = await requireAdmin();
  } catch (err) {
    redirect('/admin/login');
  }
  
  // 2. Define Server Action for Logout
  async function logoutAction() {
    'use server';
    const { signOut } = await import('@/lib/auth/config');
    const { redirect } = await import('next/navigation');
    
    // Sign out without Auth.js redirecting
    await signOut({ redirect: false });
    
    // Use Next.js native relative redirect (which the browser resolves correctly)
    redirect('/admin/login');
  }

  return (
    <AdminLayoutShell admin={admin} logoutAction={logoutAction}>
      {children}
    </AdminLayoutShell>
  );
}
