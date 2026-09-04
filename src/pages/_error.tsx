import type { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#b5830a', margin: 0 }}>
        {statusCode || 'Error'}
      </h1>
      <p style={{ color: '#666', marginTop: '1rem' }}>
        {statusCode === 404
          ? 'This page could not be found.'
          : 'An unexpected error has occurred.'}
      </p>
      <a
        href="/"
        style={{
          marginTop: '2rem',
          padding: '0.75rem 2rem',
          background: '#b5830a',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Go Home
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
