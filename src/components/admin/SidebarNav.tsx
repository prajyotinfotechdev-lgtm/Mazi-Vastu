'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Building2, Users, UserPlus, Settings, Megaphone, Briefcase } from 'lucide-react';
import styles from '@/app/admin/admin-layout.module.css';

const navLinks = [
  { name: 'Overview', href: '/admin', icon: Home },
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Property Types', href: '/admin/property-types', icon: LayoutDashboard },
  { name: 'Advertisements', href: '/admin/advertisements', icon: Megaphone },
  { name: 'Services', href: '/admin/services', icon: Briefcase },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Leads', href: '/admin/leads', icon: UserPlus },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div style={{ marginBottom: '1rem', paddingLeft: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--mv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Menu
      </div>
      {navLinks.map((link) => {
        const Icon = link.icon;
        // Dashboard is exact match, others are prefix match
        const isActive = link.href === '/admin' 
          ? pathname === '/admin' 
          : pathname.startsWith(link.href);

        return (
          <Link 
            key={link.name} 
            href={link.href} 
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
          >
            <Icon className={`${styles.navIcon} ${isActive ? styles.navIconActive : ''}`} size={18} />
            <span style={{ fontWeight: isActive ? 600 : 500 }}>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
