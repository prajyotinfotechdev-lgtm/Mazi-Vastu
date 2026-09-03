'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Info } from 'lucide-react';
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

export default function PushNotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          console.log('Push messaging is not supported');
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err) {
        console.error('Error checking subscription', err);
      } finally {
        setLoading(false);
      }
    }
    checkSubscription();
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Workers are not supported by this browser.');
      }

      const registration = await navigator.serviceWorker.ready;

      if (isSubscribed) {
        // Unsubscribe
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          
          // Inform backend
          await fetch('/api/admin/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint })
          });
        }
        setIsSubscribed(false);
        toast.success('Push notifications disabled');
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Permission not granted for Notification');
        }

        const response = await fetch('/api/admin/push/vapid-public-key');
        const { publicKey } = await response.json();
        
        const convertedVapidKey = urlBase64ToUint8Array(publicKey);

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });

        // Send to backend
        const res = await fetch('/api/admin/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });

        if (!res.ok) {
          throw new Error('Failed to save subscription on server');
        }

        setIsSubscribed(true);
        toast.success('Push notifications enabled!');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mv-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'var(--mv-bg-elevated)', borderRadius: '12px', border: '1px solid var(--mv-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '40px', height: '40px', borderRadius: '10px',
          background: isSubscribed ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          color: isSubscribed ? '#22c55e' : 'var(--mv-text-secondary)'
        }}>
          {isSubscribed ? <Bell size={20} /> : <BellOff size={20} />}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--mv-text)' }}>
            Push Notifications
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--mv-text-secondary)' }}>
            Receive instant alerts when new leads arrive.
          </p>
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={loading}
        className="mv-action-btn"
        style={{
          background: isSubscribed ? 'rgba(239, 68, 68, 0.1)' : 'var(--mv-accent)',
          color: isSubscribed ? '#ef4444' : '#1a1a1a',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          border: 'none',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        {loading ? 'Processing...' : isSubscribed ? 'Disable' : 'Enable'}
      </button>
    </div>
  );
}
