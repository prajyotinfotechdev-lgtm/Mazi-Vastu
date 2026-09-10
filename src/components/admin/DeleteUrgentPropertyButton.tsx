'use client';

import { useState, CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteUrgentPropertyButtonProps {
  id: string;
  title: string;
}

const buttonStyle: CSSProperties = {
  background: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  padding: '0.6rem',
  borderRadius: '8px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
};

export default function DeleteUrgentPropertyButton({ id, title }: DeleteUrgentPropertyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete urgent property: "${title.slice(0, 30)}..."?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/urgent-properties/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || 'Failed to delete');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      title="Delete Property"
      style={{
        ...buttonStyle,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}
