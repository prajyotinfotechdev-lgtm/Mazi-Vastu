'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { t } from '@/lib/i18n/translate';
import logoImg from '@/assets/Logo.jpeg';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function Navbar({ lang = 'en' }: { lang?: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('nav.home', lang as any) },
    { href: '/properties', label: t('nav.properties', lang as any) },
    { href: '/services', label: t('nav.concierge', lang as any) },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/' || pathname === '/mr';
    return pathname.startsWith(href);
  };

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      paddingTop: '1rem'
    }}>
      <nav
        className="mv-navbar-wrapper"
        style={{
          width: '100%',
          background: 'transparent',
          borderBottom: 'none',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--mv-max-width)',
            margin: '0 auto',
            padding: '0 var(--mv-space-base)',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            height: '100%',
          }}
        >
          {/* Left side: Navigation */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <div
              className="hidden-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'var(--mv-bg-surface)',
                border: '1px solid var(--mv-border)',
                borderRadius: 'var(--mv-radius-full)',
                padding: '0.25rem',
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: 'var(--mv-radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isActive(link.href) ? 'var(--mv-text-on-accent)' : 'var(--mv-text-secondary)',
                    background: isActive(link.href) ? 'var(--mv-accent)' : 'transparent',
                    transition: 'all 200ms ease',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>


          </div>

          {/* Center: empty */}
          <div />

          {/* Right side */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
            {/* Social Icons */}
            <div
              style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}
            >
              <Link href="https://www.instagram.com/mazivastu?igsi=MTd4bjl0bXdicWhuYw==" target="_blank" aria-label="Instagram" className="nav-social-icon instagram">
                <InstagramIcon />
              </Link>
              <Link href="https://www.facebook.com/share/1CzFgHxHGp/" target="_blank" aria-label="Facebook" className="nav-social-icon facebook">
                <FacebookIcon />
              </Link>
              <Link href="https://youtube.com/@mazivastu?si=kuRH8pE21eh4MIhb" target="_blank" aria-label="YouTube" className="nav-social-icon youtube">
                <YouTubeIcon />
              </Link>
            </div>

            <LanguageSwitcher currentLang={lang} />

            {/* Desktop CTA */}
            <Link
              href="/contact"
              className="hidden-mobile"
              style={{
                textDecoration: 'none',
                background: 'var(--mv-accent)',
                color: 'var(--mv-text-on-accent)',
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--mv-radius-full)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 200ms ease',
              }}
            >
              {t('nav.contactUs', lang as any)}
              <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="mv-mobile-menu">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--mv-space-3xl)',
            }}
          >
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden' }}>
                <Image src={logoImg} alt="MaziVastu Logo" width={36} height={36} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mv-text)', fontFamily: 'Outfit, sans-serif' }}>
                Mazi<span style={{ color: 'var(--mv-accent)' }}>Vastu</span>
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{ background: 'none', border: 'none', color: 'var(--mv-text-secondary)', cursor: 'pointer', padding: '0.5rem' }}
            >
              <X size={24} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--mv-radius-md)',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  color: isActive(link.href) ? 'var(--mv-accent)' : 'var(--mv-text)',
                  background: isActive(link.href) ? 'var(--mv-accent-muted)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 200ms ease',
                  borderLeft: isActive(link.href) ? '3px solid var(--mv-accent)' : '3px solid transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--mv-radius-md)',
                fontSize: '1.125rem',
                fontWeight: 600,
                color: isActive('/contact') ? 'var(--mv-accent)' : 'var(--mv-text)',
                background: isActive('/contact') ? 'var(--mv-accent-muted)' : 'transparent',
                textDecoration: 'none',
                borderLeft: isActive('/contact') ? '3px solid var(--mv-accent)' : '3px solid transparent',
              }}
            >
              {t('nav.contactUs', lang as any)}
            </Link>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 'var(--mv-space-2xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <Link href="https://www.instagram.com/mazivastu?igsi=MTd4bjl0bXdicWhuYw==" target="_blank" aria-label="Instagram" className="nav-social-icon instagram" style={{ width: '40px', height: '40px' }}>
                <InstagramIcon />
              </Link>
              <Link href="https://www.facebook.com/share/1CzFgHxHGp/" target="_blank" aria-label="Facebook" className="nav-social-icon facebook" style={{ width: '40px', height: '40px' }}>
                <FacebookIcon />
              </Link>
              <Link href="https://youtube.com/@mazivastu?si=kuRH8pE21eh4MIhb" target="_blank" aria-label="YouTube" className="nav-social-icon youtube" style={{ width: '40px', height: '40px' }}>
                <YouTubeIcon />
              </Link>
            </div>

            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="mv-btn mv-btn-primary mv-btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {t('nav.contactUs', lang as any)}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
