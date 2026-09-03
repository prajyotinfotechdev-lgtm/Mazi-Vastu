'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';

interface PropertyType {
  id: string;
  name: string;
}

interface PremiumSearchBarProps {
  propertyTypes: PropertyType[];
  initialQuery?: string;
  initialType?: string;
  placeholder?: string;
}

export default function PremiumSearchBar({ propertyTypes, initialQuery = '', initialType = '', placeholder = "Search properties..." }: PremiumSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);

  // Modal states
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Close modals on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileModalOpen(false);
        setIsFilterModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (type) params.set('type', type);

    // Close modals
    setIsMobileModalOpen(false);
    setIsFilterModalOpen(false);

    // Soft routing to properties page
    router.push(`/properties?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery('');
    setType('');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Desktop Search Bar (Inline) */
        .premium-search-desktop {
          display: none;
          background: var(--mv-bg-surface);
          border: 1px solid var(--mv-border);
          border-radius: 999px;
          padding: 8px 8px 8px 24px;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          max-width: 800px;
          margin: 0 auto;
          transition: all 0.3s ease;
        }
        .premium-search-desktop:focus-within {
          border-color: var(--mv-accent);
          box-shadow: 0 4px 24px rgba(245, 197, 24, 0.15);
        }
        
        /* Mobile Floating Pill */
        .premium-search-mobile-pill {
          display: flex;
          background: rgba(20,20,20,0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          padding: 12px 20px;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          cursor: pointer;
          position: sticky;
          top: 80px;
          z-index: 40;
          margin: 0 16px 24px 16px;
        }
        
        @media (min-width: 768px) {
          .premium-search-desktop {
            display: flex;
          }
          .premium-search-mobile-pill {
            display: none;
          }
        }
        
        /* Full Screen Mobile Modal */
        .search-mobile-modal {
          position: fixed;
          inset: 0;
          background: var(--mv-bg);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />

      {/* --- DESKTOP VIEW --- */}
      <form onSubmit={handleSearch} className="premium-search-desktop">
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '12px' }}>
          <Search size={20} color="var(--mv-text-muted)" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            style={{
              background: 'transparent', border: 'none', color: 'var(--mv-text)',
              fontSize: '1rem', width: '100%', outline: 'none'
            }}
          />
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--mv-border)' }}></div>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            style={{
              background: 'transparent', border: 'none', color: type ? 'var(--mv-accent)' : 'var(--mv-text)',
              display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9375rem', padding: '8px 16px'
            }}
          >
            <Filter size={18} />
            {type ? 'Filtered' : 'Any Type'}
          </button>
        </div>

        <button type="submit" className="mv-btn mv-btn-primary" style={{ padding: '12px 24px', borderRadius: '999px' }}>
          Search
        </button>
      </form>

      {/* --- MOBILE VIEW: FLOATING PILL --- */}
      <div className="premium-search-mobile-pill" onClick={() => setIsMobileModalOpen(true)}>
        <Search size={20} color="var(--mv-text)" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--mv-text)' }}>
            {query || "Where to?"}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--mv-text-muted)' }}>
            {type ? propertyTypes.find(t => t.id === type)?.name : "Any property type"}
          </span>
        </div>
      </div>

      {/* --- MOBILE FULL SCREEN MODAL --- */}
      {isMobileModalOpen && (
        <div className="search-mobile-modal">
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--mv-border)' }}>
            <button type="button" onClick={() => setIsMobileModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--mv-text)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>Search</span>
            <button type="button" onClick={handleClear} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--mv-text-muted)', fontSize: '0.875rem' }}>
              Clear
            </button>
          </div>

          <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Where to?</h3>
              <div style={{ position: 'relative' }}>
                <Search size={20} color="var(--mv-text-muted)" style={{ position: 'absolute', left: '16px', top: '16px' }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search location, property..."
                  style={{
                    width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px',
                    background: 'var(--mv-bg-surface)', border: '1px solid var(--mv-border)',
                    color: 'var(--mv-text)', fontSize: '1rem', outline: 'none'
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>Property Type</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setType('')}
                  style={{
                    padding: '12px', borderRadius: '12px',
                    background: type === '' ? 'var(--mv-accent)' : 'var(--mv-bg-surface)',
                    color: type === '' ? '#000' : 'var(--mv-text)',
                    border: `1px solid ${type === '' ? 'var(--mv-accent)' : 'var(--mv-border)'}`,
                    fontWeight: 600, textAlign: 'center'
                  }}
                >
                  Any
                </button>
                {propertyTypes.map(pt => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setType(pt.id)}
                    style={{
                      padding: '12px', borderRadius: '12px',
                      background: type === pt.id ? 'var(--mv-accent)' : 'var(--mv-bg-surface)',
                      color: type === pt.id ? '#000' : 'var(--mv-text)',
                      border: `1px solid ${type === pt.id ? 'var(--mv-accent)' : 'var(--mv-border)'}`,
                      fontWeight: 600, textAlign: 'center'
                    }}
                  >
                    {pt.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--mv-border)', background: 'var(--mv-bg-surface)' }}>
            <button
              type="button"
              onClick={handleSearch}
              className="mv-btn mv-btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.125rem', borderRadius: '12px' }}
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* --- DESKTOP FILTER MODAL --- */}
      {isFilterModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--mv-bg-elevated)', width: '100%', maxWidth: '400px',
            borderRadius: '24px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: '1px solid var(--mv-border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Filters</h2>
              <button onClick={() => setIsFilterModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--mv-text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--mv-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                Property Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', background: 'var(--mv-bg-input)',
                  border: '1px solid var(--mv-border)', borderRadius: '12px',
                  color: 'var(--mv-text)', fontSize: '1rem', outline: 'none'
                }}
              >
                <option value="">All Categories</option>
                {propertyTypes.map(pt => (
                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                ))}
              </select>
            </div>
            <button onClick={handleSearch} className="mv-btn mv-btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px' }}>
              Apply
            </button>
          </div>
        </div>
      )}
    </>
  );
}
