'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AddPropertyTypeModalProps {
  onClose: () => void;
  onSuccess: (newType: any) => void;
  rootTypes: { id: string; name: string }[];
}

export default function AddPropertyTypeModal({ onClose, onSuccess, rootTypes }: AddPropertyTypeModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        parentId: formData.parentId || null,
        isActive: true,
      };

      const res = await fetch('/api/admin/property-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to create property type');
      }

      const newType = await res.json();
      onSuccess(newType);
      toast.success('Property type created successfully!');
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', width: '100%', maxWidth: '400px',
        padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Add Property Type</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#334155' }}>
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Villa"
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#334155' }}>
              Parent Category (Optional)
            </label>
            <select
              value={formData.parentId}
              onChange={e => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: 'white' }}
            >
              <option value="">None (Top Level)</option>
              {rootTypes.map(root => (
                <option key={root.id} value={root.id}>{root.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.625rem 1.25rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: '0.625rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading ? 'Saving...' : <><Plus size={16} /> Add Type</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
