'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CustomersFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [source, setSource] = useState(searchParams.get('source') || '');

  // Sync state to URL with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (query) params.set('q', query);
      else params.delete('q');

      if (source) params.set('source', source);
      else params.delete('source');

      const newQueryString = params.toString();
      const currentQueryString = searchParams.toString();
      
      if (newQueryString !== currentQueryString) {
        params.set('page', '1');
        router.push(`?${params.toString()}`);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [query, source, router, searchParams]);

  const clearFilters = () => {
    setQuery('');
    setSource('');
    router.push('?');
  };

  const hasActiveFilters = !!(query || source);

  return (
    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--mv-border)', background: 'var(--mv-bg-surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 500 }}>
        <Filter size={16} />
        <span style={{ fontSize: '0.875rem' }}>Filters</span>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            style={{ 
              marginLeft: 'auto', 
              background: 'none', 
              border: 'none', 
              color: 'var(--mv-text-accent)', 
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <X size={14} /> Clear all
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mv-text-muted)' }} size={16} />
          <input 
            type="text" 
            placeholder="Search by name, mobile, or email..." 
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
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{
            flex: '1 1 150px',
            padding: '0.625rem 1rem',
            border: '1px solid var(--mv-border)',
            background: 'var(--mv-bg)',
            color: 'var(--mv-text)',
            borderRadius: '6px',
            outline: 'none',
            fontSize: '0.875rem',
          }}
        >
          <option value="">All Sources</option>
          <option value="REGISTRATION">Registration</option>
          <option value="CONSULTATION">Consultation</option>
          <option value="SERVICE_CONTACT">Service Contact</option>
          <option value="PROPERTY_INTEREST">Property Interest</option>
        </select>
      </div>
    </div>
  );
}
