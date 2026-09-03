'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DeletePropertyTypeButton({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the property type "${name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/property-types/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to delete property type');
      }
      router.refresh();
      toast.success('Property type deleted');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="mv-action-btn"
      style={{
        background: 'none',
        border: 'none',
        color: '#ef4444',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.5 : 1
      }}
      title={`Delete ${name}`}
    >
      <Trash2 size={18} />
    </button>
  );
}
