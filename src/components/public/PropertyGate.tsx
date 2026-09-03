'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, X } from 'lucide-react';

interface PropertyGateProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyGate({ propertyId, isOpen, onClose }: PropertyGateProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/public/register-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, propertyId })
      });

      if (!res.ok) {
        throw new Error('Failed to register. Please try again.');
      }

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="mv-modal-overlay">
      <div className="mv-modal-content">
        
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mv-text-muted)' }}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 'var(--mv-space-xl)' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'var(--mv-accent-muted)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--mv-space-base) auto',
          }}>
            <Lock size={22} color="var(--mv-accent)" />
          </div>
          <h3 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--mv-text)', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
            Unlock Property Details
          </h3>
          <p style={{ color: 'var(--mv-text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Please provide your details to view the full location, exact size, and pricing for this property.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="mv-error-box">{error}</div>}
          
          <div>
            <label className="mv-label-text">Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text" required className="mv-input"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mv-label-text">Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="tel" required className="mv-input"
              value={formData.phone}
              onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="mv-label-text">Email <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="email" required className="mv-input"
              value={formData.email}
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
            />
          </div>
          
          <button type="submit" disabled={loading} className="mv-btn mv-btn-primary mv-btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Unlocking...' : 'Unlock Details'}
          </button>
        </form>
      </div>
    </div>
  );
}
