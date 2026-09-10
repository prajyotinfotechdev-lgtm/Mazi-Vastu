'use client';

import React, { useState, CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, MapPin, FileText } from 'lucide-react';

const LOCATIONS = [
  'Ausa Road',
  'Barshi Road',
  'Ambejogai Road',
  'Nanded Road',
];

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(4px)',
  padding: '1rem',
};

const modalContentStyle: CSSProperties = {
  background: '#0f172a',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: '2rem',
  maxWidth: '520px',
  width: '100%',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  color: '#f8fafc',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#ffffff',
  fontSize: '0.95rem',
  outline: 'none',
};

export default function UrgentPropertyForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter property details/info.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/urgent-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          location,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Failed to create urgent property');
      }

      setTitle('');
      setLocation(LOCATIONS[0]);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-add-premium"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'linear-gradient(135deg, #f5c518 0%, #d4a000 100%)',
          color: '#0f172a',
          fontWeight: 700,
          padding: '0.875rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.2)',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(245, 197, 24, 0.3)',
        }}
      >
        <Plus size={20} strokeWidth={2.5} /> Add Urgent Property
      </button>

      {isOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
              Add Urgent + Rent Property
            </h2>
            <p style={{ margin: '0 0 1.5rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
              Post text-only urgent / rent property info. It will display directly under the search bar on the homepage.
            </p>

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  <MapPin size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Select Location (Choose 1 of 4)
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={inputStyle}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  <FileText size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                  Property Info / Description (Text only)
                </label>
                <textarea
                  rows={4}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 2 BHK Rent Flat available at prime location. Contact: 98xxxxxxxx"
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #f5c518 0%, #d4a000 100%)',
                    border: 'none',
                    color: '#0f172a',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Publishing...' : 'Publish Urgent Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
