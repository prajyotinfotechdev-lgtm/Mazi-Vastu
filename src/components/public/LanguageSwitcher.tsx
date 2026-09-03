'use client';

import { usePathname } from 'next/navigation';

interface LanguageSwitcherProps {
  currentLang: string;
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const isMarathi = currentLang === 'mr';

  return (
    <form action="/api/public/set-language" method="POST">
      <input type="hidden" name="lang" value={isMarathi ? 'en' : 'mr'} />
      <input type="hidden" name="redirectTo" value={pathname} />
      <button
        type="submit"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          background: 'var(--mv-bg-surface)',
          border: '1px solid var(--mv-border)',
          borderRadius: 'var(--mv-radius-sm)',
          padding: '0.375rem 0.625rem',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--mv-text-secondary)',
          transition: 'border-color 200ms ease, color 200ms ease',
        }}
      >
        <span style={{ fontSize: '0.875rem' }}>{isMarathi ? '🇬🇧' : '🇮🇳'}</span>
        {isMarathi ? 'EN' : 'मराठी'}
      </button>
    </form>
  );
}
