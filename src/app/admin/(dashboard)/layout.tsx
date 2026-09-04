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
    const { headers } = await import('next/headers');
    
    const h = headers();
    const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
    const protocol = h.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    await signOut({ redirectTo: `${baseUrl}/admin/login` });
  }

  return (
    <AdminLayoutShell admin={admin} logoutAction={logoutAction}>
      {children}
    </AdminLayoutShell>
  );
}
