import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
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
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '1rem', color: 'var(--mv-text, #1a1a1a)' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--mv-muted, #666)', marginTop: '0.5rem', maxWidth: '400px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 2rem',
          background: 'var(--mv-accent, #b5830a)',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
