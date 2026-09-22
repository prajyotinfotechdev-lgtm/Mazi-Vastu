'use client';

import React, { useState } from 'react';
import Link from '@/components/ui/LoaderLink';
import { Home, Map, Building, Building2, Store, Mountain, Key, Info, MapPin, X } from 'lucide-react';

const getCategoryIcon = (name: string, size: number = 28) => {
  const lower = name.toLowerCase();
  if (lower.includes('home')) return <Home size={size} strokeWidth={1.5} />;
  if (lower.includes('plot')) return <Map size={size} strokeWidth={1.5} />;
  if (lower.includes('row')) return <Building size={size} strokeWidth={1.5} />;
  if (lower.includes('flat') || lower.includes('apartment')) return <Building2 size={size} strokeWidth={1.5} />;
  if (lower.includes('shop') || lower.includes('commercial')) return <Store size={size} strokeWidth={1.5} />;
  if (lower.includes('land')) return <Mountain size={size} strokeWidth={1.5} />;
  if (lower.includes('rent')) return <Key size={size} strokeWidth={1.5} />;
  if (lower.includes('bungalow')) return <Home size={size} strokeWidth={1.5} />;
  if (lower.includes('godown')) return <Building size={size} strokeWidth={1.5} />;
  return <Info size={size} strokeWidth={1.5} />;
};

interface PropertyType {
  id: string;
  name: string;
  parentId: string | null;
}

const marathiCategoryMap: Record<string, string> = {
  'Home': 'घर',
  'Open Plot': 'खुला प्लॉट',
  'Row House': 'रो हाऊस',
  'Flat': 'फ्लॅट',
  'Shop': 'दुकान',
  'Land': 'जमीन',
  'Rent': 'भाड्याने',
  'Bungalow': 'बंगला',
  'Godown': 'गोदाम'
};

const POPULAR_LOCATIONS = ['Ausa Road', 'Barshi Road', 'Ambejogai Road', 'Nanded Road'];

export default function CategoryGrid({ propertyTypes, lang = 'mr' }: { propertyTypes: PropertyType[], lang?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<{ id: string, name: string } | null>(null);
  const parentCategories = propertyTypes.filter(type => type.parentId === null);

  return (
    <>
      <div className="mv-category-grid">
        {parentCategories.map((parent) => {
          const displayName = lang === 'mr' ? (marathiCategoryMap[parent.name] || parent.name) : parent.name;

          return (
            <React.Fragment key={parent.id}>
              <div
                onClick={() => setSelectedCategory({ id: parent.id, name: displayName })}
                className="mv-category-card"
                style={{ cursor: 'pointer' }}
              >
                <div className="mv-category-icon">
                  {getCategoryIcon(parent.name)}
                </div>
                <span className="mv-category-title">
                  {displayName}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Location Selection Modal */}
      {selectedCategory && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          padding: '20px'
        }} onClick={() => setSelectedCategory(null)}>
          <div style={{
            background: 'var(--mv-bg-elevated)',
            border: '1px solid var(--mv-border)',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedCategory(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'var(--mv-text)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.25rem', color: 'var(--mv-text)' }}>
              {lang === 'mr' ? 'स्थान निवडा' : 'Select Location'}
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.875rem', color: 'var(--mv-text-secondary)' }}>
              {lang === 'mr' ? 'कोणत्या भागात तुम्ही मालमत्ता शोधत आहात?' : 'Which area are you looking in?'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {POPULAR_LOCATIONS.map(loc => (
                <Link
                  key={loc}
                  href={`/properties?type=${selectedCategory.id}&location=${encodeURIComponent(loc)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'var(--mv-text)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(245, 197, 24, 0.1)';
                    e.currentTarget.style.borderColor = 'var(--mv-accent)';
                    e.currentTarget.style.color = 'var(--mv-accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'var(--mv-text)';
                  }}
                  onClick={() => setSelectedCategory(null)}
                >
                  <MapPin size={18} style={{ marginRight: '12px' }} />
                  {loc}
                </Link>
              ))}
              <Link
                  href={`/properties?type=${selectedCategory.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 16px',
                    background: 'var(--mv-accent)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    marginTop: '10px',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedCategory(null)}
                >
                  {lang === 'mr' ? 'सर्व स्थाने पहा' : 'View All Locations'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
