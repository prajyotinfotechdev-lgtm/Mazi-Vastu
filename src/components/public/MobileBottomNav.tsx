'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, Briefcase, Phone } from 'lucide-react';

interface MobileBottomNavProps {
  lang?: string;
}

export default function MobileBottomNav({ lang = 'en' }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: lang === 'mr' ? 'मुख्य' : 'Home' },
    { href: '/properties', icon: Building2, label: lang === 'mr' ? 'मालमत्ता' : 'Properties' },
    { href: '/services', icon: Briefcase, label: lang === 'mr' ? 'सेवा' : 'Services' },
    { href: '/contact', icon: Phone, label: lang === 'mr' ? 'संपर्क' : 'Contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/mr';
    return pathname.startsWith(href);
  };

  return (
    <nav className="mv-bottom-nav" aria-label="Mobile navigation">
      {navItems.map((item, index) => {
        const IconComp = item.icon;
        const active = isActive(item.href);
        return (
          <div key={item.href} style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'center', height: '100%' }}>
            {index > 0 && <div className="mv-bottom-nav-divider" />}
            <Link
              href={item.href}
              className={`mv-bottom-nav-item ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <div className="mv-bottom-nav-icon-wrapper">
                <IconComp size={18} strokeWidth={active ? 2.5 : 1.5} />
              </div>
              <span className="mv-bottom-nav-label">{item.label}</span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
