'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        fontFamily: 'var(--font-plus-jakarta, sans-serif)',
      }}
    >
      <h1 style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--mv-accent, #b5830a)', margin: 0 }}>
        500
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '1rem', color: 'var(--mv-text, #1a1a1a)' }}>
        Something went wrong
      </h2>
      <p style={{ color: 'var(--mv-muted, #666)', marginTop: '0.5rem', maxWidth: '400px' }}>
        An unexpected error occurred. Please try again.
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 2rem',
            background: 'var(--mv-accent, #b5830a)',
            color: '#fff',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{
            padding: '0.75rem 2rem',
            background: 'transparent',
            color: 'var(--mv-accent, #b5830a)',
            borderRadius: '8px',
            border: '2px solid var(--mv-accent, #b5830a)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
