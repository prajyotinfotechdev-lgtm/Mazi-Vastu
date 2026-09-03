'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdvertisementsFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialQuery = searchParams.get('q') || '';
  const initialStatus = searchParams.get('status') || '';

  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(initialStatus);

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set('q', query);
      } else {
        params.delete('q');
      }
      params.set('page', '1'); // Reset to page 1 on search
      router.push(`?${params.toString()}`);
    }, 500);
    return () => clearTimeout(timeout);
  }, [query, router, searchParams]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus) {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }
    params.set('page', '1'); // Reset to page 1 on filter
    router.push(`?${params.toString()}`);
  };

  return (
    <div style={{ padding: '1rem', borderBottom: '1px solid var(--mv-border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', background: 'var(--mv-bg-surface)' }}>
      <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mv-text-muted)' }} size={18} />
        <input 
          type="text" 
          placeholder="Search advertisements..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.625rem 1rem 0.625rem 2.5rem', 
            border: '1px solid var(--mv-border)', 
            background: 'var(--mv-bg)',
            color: 'var(--mv-text)',
            borderRadius: '6px',
            outline: 'none',
            fontSize: '0.875rem'
          }} 
        />
      </div>
      
      <select 
        value={status}
        onChange={handleStatusChange}
        style={{ 
          padding: '0.625rem 1rem', 
          border: '1px solid var(--mv-border)', 
          borderRadius: '6px',
          outline: 'none',
          fontSize: '0.875rem',
          background: 'var(--mv-bg)',
          color: 'var(--mv-text)',
          minWidth: '150px'
        }}
      >
        <option value="">All Statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="DRAFT">Draft</option>
        <option value="INACTIVE">Inactive</option>
        <option value="EXPIRED">Expired</option>
      </select>
    </div>
  );
}
