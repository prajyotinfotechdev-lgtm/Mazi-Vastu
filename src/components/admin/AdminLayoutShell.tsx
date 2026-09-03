'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import styles from '@/app/admin/admin-layout.module.css';
import SidebarNav from './SidebarNav';

export default function AdminLayoutShell({ children, admin, logoutAction }: { children: React.ReactNode, admin: any, logoutAction: (formData: FormData) => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Prevent scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className={styles.layoutContainer}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 35, backdropFilter: 'blur(4px)' }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/admin" className={styles.brand}>Mazi<span>Vastu</span></Link>
          <button className={styles.menuButton} onClick={() => setIsSidebarOpen(false)} aria-label="Close Menu">
            <X size={24} />
          </button>
        </div>
        <SidebarNav />
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <button className={styles.menuButton} onClick={() => setIsSidebarOpen(true)} aria-label="Open Menu">
            <Menu size={24} />
          </button>

          <div className={styles.userProfile}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{admin.name}</span>
              <span className={styles.userEmail}>{admin.email}</span>
            </div>
            
            <form action={logoutAction}>
              <button type="submit" className={styles.logoutBtn} title="Logout">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </header>

        {/* Page Content Wrapper */}
        <main className={styles.pageWrapper}>
          {children}
        </main>
      </div>
    </div>
  );
}
