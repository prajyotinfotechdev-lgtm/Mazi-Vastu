'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or already installed as standalone
    const hasDismissed = localStorage.getItem('mv_install_dismissed');
    if (hasDismissed) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Detect iOS
    const iosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosDevice);

    // Listen for the browser's install readiness event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after a delay so it doesn't stack with the push notification prompt
      setTimeout(() => setShow(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS: show a manual prompt after a delay
    if (iosDevice) {
      const timer = setTimeout(() => setShow(true), 5000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOS) {
      toast('Tap the Share button ⎋ at the bottom, then tap "Add to Home Screen"', {
        icon: '📱',
        duration: 6000,
      });
      handleDismiss();
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('MaziVastu app installed!');
      }
      setDeferredPrompt(null);
      setShow(false);
      localStorage.setItem('mv_install_dismissed', 'true');
    }
  }, [deferredPrompt, isIOS]);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('mv_install_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9998,
      background: 'rgba(15, 15, 15, 0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(245, 197, 24, 0.2)',
      padding: '1.25rem 1.5rem',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 197, 24, 0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: 'calc(100vw - 2rem)',
      width: '440px',
      animation: 'mv-install-slide 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mv-install-slide {
          from { transform: translate(-50%, -120%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}} />

      {/* Close button */}
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.3)', padding: '4px',
        }}
      >
        <X size={16} />
      </button>

      {/* Icon */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '48px', height: '48px', borderRadius: '12px',
        background: 'rgba(245, 197, 24, 0.1)',
        color: '#f5c518',
        flexShrink: 0,
      }}>
        <Download size={24} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <h4 style={{
          margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700,
          color: '#fff', fontFamily: 'Outfit, sans-serif',
        }}>
          Install MaziVastu App
        </h4>
        <p style={{
          margin: '0 0 0.75rem 0', fontSize: '0.8rem',
          color: 'var(--mv-text-secondary)', lineHeight: 1.4,
        }}>
          Get instant access to the best property deals in Latur.
        </p>

        <button
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg, #f5c518 0%, #d4a000 100%)',
            color: '#0a0a0a',
            padding: '0.55rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            width: '100%',
            boxShadow: '0 4px 12px rgba(245, 197, 24, 0.25)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 197, 24, 0.35)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 197, 24, 0.25)';
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Install App
          </span>
        </button>
      </div>
    </div>
  );
}
