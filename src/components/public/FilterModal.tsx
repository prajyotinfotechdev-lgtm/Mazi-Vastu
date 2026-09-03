'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

export default function FilterModal({ propertyTypes, currentType }: { propertyTypes: any[], currentType: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(currentType);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="mv-btn" style={{
        background: currentType ? 'var(--mv-accent)' : 'var(--mv-bg-surface)',
        border: `1px solid ${currentType ? 'var(--mv-accent)' : 'var(--mv-border)'}`,
        color: currentType ? '#000' : 'var(--mv-text)',
        padding: '0.875rem 1.5rem',
        borderRadius: 'var(--mv-radius-full)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 600,
        transition: 'all 200ms ease'
      }}>
        <Filter size={18} />
        Filter {(selectedType || currentType) && '• 1'}
      </button>

      {/* Always render the hidden input with the selected state so it's captured on submit */}
      <input type="hidden" name="type" value={selectedType} />

      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          animation: 'fadeIn 200ms ease'
        }}>
          <div style={{
            background: 'var(--mv-bg-elevated)',
            width: '100%',
            maxWidth: '500px',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            padding: '24px',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
            border: '1px solid var(--mv-border)',
            borderBottom: 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--mv-text)' }}>Filters</h2>
              <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--mv-text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--mv-text-secondary)', marginBottom: '8px', fontWeight: 600 }}>
                Property Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--mv-bg-input)',
                  border: '1px solid var(--mv-border)',
                  borderRadius: '12px',
                  color: 'var(--mv-text)',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              >
                <option value="">All Categories</option>
                {propertyTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => setSelectedType('')} style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid var(--mv-border)',
                color: 'var(--mv-text)',
                padding: '12px',
                borderRadius: '50px',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                Clear
              </button>
              <button type="submit" onClick={() => {
                // Short timeout allows form to submit before closing modal
                setTimeout(() => setIsOpen(false), 50);
              }} style={{
                flex: 2,
                background: 'var(--mv-accent)',
                border: 'none',
                color: '#000',
                padding: '12px',
                borderRadius: '50px',
                fontWeight: 700,
                cursor: 'pointer'
              }}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
