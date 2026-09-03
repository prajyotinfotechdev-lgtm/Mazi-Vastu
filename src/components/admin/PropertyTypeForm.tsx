'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface PropertyType {
  id: string;
  name: string;
  parentId: string | null;
  description: string | null;
}

interface PropertyTypeFormProps {
  rootTypes: PropertyType[];
  initialData?: PropertyType;
}

export default function PropertyTypeForm({ rootTypes, initialData }: PropertyTypeFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    parentId: initialData?.parentId || '',
    description: initialData?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        parentId: formData.parentId || null,
        description: formData.description,
        isActive: true,
      };

      const url = isEdit ? `/api/admin/property-types/${initialData.id}` : '/api/admin/property-types';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || `Failed to ${isEdit ? 'update' : 'create'} property type`);
      }

      toast.success(`Property type ${isEdit ? 'updated' : 'created'} successfully!`);
      router.push('/admin/property-types');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mv-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--mv-text-secondary)' }}>
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--mv-border)', borderRadius: '6px', outline: 'none', background: 'var(--mv-bg)', color: 'var(--mv-text)' }}
            placeholder="e.g. Commercial"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--mv-text-secondary)' }}>
            Parent Category (Optional)
          </label>
          <select
            value={formData.parentId}
            onChange={e => setFormData(prev => ({ ...prev, parentId: e.target.value }))}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--mv-border)', borderRadius: '6px', outline: 'none', background: 'var(--mv-bg)', color: 'var(--mv-text)' }}
          >
            <option value="">None (Top Level)</option>
            {rootTypes.filter(rt => rt.id !== initialData?.id).map(root => (
              <option key={root.id} value={root.id}>{root.name}</option>
            ))}
          </select>
          <p style={{ fontSize: '0.75rem', color: 'var(--mv-text-muted)', marginTop: '0.25rem' }}>Select a parent if this is a subcategory (e.g. Office Space inside Commercial).</p>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--mv-text-secondary)' }}>
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--mv-border)', borderRadius: '6px', outline: 'none', resize: 'vertical', background: 'var(--mv-bg)', color: 'var(--mv-text)' }}
            placeholder="Brief description of this property type..."
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', padding: '1.5rem', background: 'var(--mv-bg-elevated)', borderRadius: '12px', border: '1px solid var(--mv-border)' }}>
          <Link href="/admin/property-types" style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--mv-border)', borderRadius: '8px', color: 'var(--mv-text)', textDecoration: 'none', fontWeight: 500 }}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--mv-accent)',
              color: '#1a1a1a',
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(245, 197, 24, 0.2)'
            }}
          >
            <Save size={18} />
            {loading ? 'Saving...' : (isEdit ? 'Update Type' : 'Create Type')}
          </button>
        </div>
      </div>
    </form>
  );
}
