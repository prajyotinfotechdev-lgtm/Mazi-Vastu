'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

interface LeadDetailsClientProps {
  leadId: string;
  initialStatus: string;
  initialNotes: string | null;
}

export default function LeadDetailsClient({ leadId, initialStatus, initialNotes }: LeadDetailsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || 'Failed to update lead');
      }

      router.refresh();
      // Optional: show a success toast here
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mv-card" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--mv-text)', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
        Manage Lead
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--mv-text-secondary)' }}>Update Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: '100%', maxWidth: '300px', padding: '0.75rem', border: '1px solid var(--mv-border)', borderRadius: '6px', outline: 'none', background: 'var(--mv-bg)', color: 'var(--mv-text)' }}
          >
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="CLOSED">Closed (Success)</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--mv-text-secondary)' }}>Private Admin Notes</label>
          <textarea
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--mv-border)', borderRadius: '6px', outline: 'none', resize: 'vertical', background: 'var(--mv-bg)', color: 'var(--mv-text)' }}
            placeholder="Add internal notes about this lead..."
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--mv-text-muted)', marginTop: '0.25rem' }}>These notes are only visible to administrators.</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--mv-accent)',
            color: '#1a1a1a',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(245, 197, 24, 0.2)'
          }}
        >
          <Save size={20} />
          {loading ? 'Saving...' : 'Save Updates'}
        </button>
      </div>
    </form>
  );
}
