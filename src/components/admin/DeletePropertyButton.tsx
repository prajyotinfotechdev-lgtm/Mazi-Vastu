'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DeletePropertyButton({ id, title }: { id: string; title: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the property "${title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete property');
      }

      router.refresh();
      toast.success('Property deleted');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="mv-action-btn"
      style={{ 
        color: '#ef4444', 
        background: 'none', 
        border: 'none', 
        cursor: isDeleting ? 'not-allowed' : 'pointer', 
        opacity: isDeleting ? 0.5 : 1
      }} 
      title="Delete"
    >
      <Trash2 size={16} />
    </button>
  );
}
