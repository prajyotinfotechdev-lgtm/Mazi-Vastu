'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('Service Worker registration failed:', err));
    }
  }, []);

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--mv-bg-elevated)',
          color: 'var(--mv-text)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.6)',
          borderRadius: '12px',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.9rem',
          padding: '16px',
        },
        success: {
          iconTheme: {
            primary: '#4ade80',
            secondary: '#000',
          },
          style: {
            borderLeft: '4px solid #4ade80',
          }
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            borderLeft: '4px solid #ef4444',
          }
        },
      }}
    />
  );
}
