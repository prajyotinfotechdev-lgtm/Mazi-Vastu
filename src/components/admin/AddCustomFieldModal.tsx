'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AddCustomFieldModalProps {
  onClose: () => void;
  onSuccess: (newField: any) => void;
}

export default function AddCustomFieldModal({ onClose, onSuccess }: AddCustomFieldModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    label: '',
    key: '',
    dataType: 'TEXT',
    optionsString: '',
    isRequired: false,
    isGated: false,
  });

  const generateKey = (label: string) => {
    return label
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .map((word, index) => {
        if (index === 0) return word.toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    setFormData(prev => ({
      ...prev,
      label,
      key: prev.key && prev.label ? prev.key : generateKey(label) // auto-generate if empty
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const options = (formData.dataType === 'SELECT' || formData.dataType === 'MULTI_SELECT')
        ? formData.optionsString.split(',').map(s => s.trim()).filter(Boolean)
        : undefined;

      const payload = {
        label: formData.label,
        key: formData.key || generateKey(formData.label),
        dataType: formData.dataType,
        options,
        isRequired: formData.isRequired,
        isGated: formData.isGated,
        isPublic: true,
        isActive: true,
      };

      const res = await fetch('/api/admin/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to create field');
      }

      const newField = await res.json();
      onSuccess(newField);
      toast.success('Custom field created successfully!');
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
        background: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px',
        padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Add Custom Field</h2>
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
              Field Label *
            </label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={handleLabelChange}
              placeholder="e.g. Furnished Status"
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#334155' }}>
              Field Key (Internal) *
            </label>
            <input
              type="text"
              required
              value={formData.key}
              onChange={e => setFormData(prev => ({ ...prev, key: e.target.value }))}
              placeholder="e.g. furnishedStatus"
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: '#f8fafc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#334155' }}>
              Data Type *
            </label>
            <select
              required
              value={formData.dataType}
              onChange={e => setFormData(prev => ({ ...prev, dataType: e.target.value }))}
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: 'white' }}
            >
              <option value="TEXT">Text</option>
              <option value="NUMBER">Number</option>
              <option value="BOOLEAN">Yes / No (Boolean)</option>
              <option value="SELECT">Single Select (Dropdown)</option>
              <option value="MULTI_SELECT">Multi Select (Checkboxes)</option>
              <option value="DATE">Date</option>
            </select>
          </div>

          {(formData.dataType === 'SELECT' || formData.dataType === 'MULTI_SELECT') && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', color: '#334155' }}>
                Options (Comma separated) *
              </label>
              <input
                type="text"
                required
                value={formData.optionsString}
                onChange={e => setFormData(prev => ({ ...prev, optionsString: e.target.value }))}
                placeholder="e.g. Fully Furnished, Semi Furnished, Unfurnished"
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isRequired}
                onChange={e => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
              />
              Required Field
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isGated}
                onChange={e => setFormData(prev => ({ ...prev, isGated: e.target.checked }))}
              />
              Hide from Guests (Gated)
            </label>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.625rem 1.25rem', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: '0.625rem 1.25rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {loading ? 'Saving...' : <><Plus size={16} /> Add Field</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
