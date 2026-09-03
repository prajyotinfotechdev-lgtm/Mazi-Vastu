'use client';

import { useState, useEffect } from 'react';
import { BellRing } from 'lucide-react';
import toast from 'react-hot-toast';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function VisitorPushOptIn() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const hasDismissed = localStorage.getItem('mv_push_dismissed');
    
    // Only check if notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    
    if (Notification.permission === 'granted' || hasDismissed) return;

    // Show after 3 seconds to let them browse first
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        handleDismiss();
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const response = await fetch('/api/admin/push/vapid-public-key');
      const { publicKey } = await response.json();
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Save anonymous subscription
      await fetch('/api/public/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      toast.success('You will now receive the best property deals!');
      setShow(false);
      localStorage.setItem('mv_push_dismissed', 'true');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('mv_push_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: 'rgba(20, 20, 20, 0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '1.5rem',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      maxWidth: 'calc(100vw - 2rem)',
      width: '420px',
      animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}} />
      
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '48px', height: '48px', borderRadius: '12px',
        background: 'rgba(245, 197, 24, 0.1)',
        color: 'var(--mv-accent)',
        flexShrink: 0
      }}>
        <BellRing size={24} />
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'white' }}>
          Get The Best Deals First
        </h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--mv-text-secondary)', lineHeight: 1.4 }}>
          Enable notifications to hear about premium properties before they hit the open market.
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              background: 'var(--mv-accent)',
              color: '#1a1a1a',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(245, 197, 24, 0.2)',
              flex: 1
            }}
          >
            {loading ? 'Processing...' : 'Allow Notifications'}
          </button>
          
          <button
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.2)', // Extremely subtle text
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
