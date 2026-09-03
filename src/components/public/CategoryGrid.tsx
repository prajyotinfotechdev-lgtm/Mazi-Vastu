'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Map, Building, Building2, Store, Mountain, Key, Info, ChevronDown, ChevronUp } from 'lucide-react';

const getCategoryIcon = (name: string, size: number = 28) => {
  const lower = name.toLowerCase();
  if (lower.includes('home')) return <Home size={size} strokeWidth={1.5} />;
  if (lower.includes('plot')) return <Map size={size} strokeWidth={1.5} />;
  if (lower.includes('row')) return <Building size={size} strokeWidth={1.5} />;
  if (lower.includes('flat') || lower.includes('apartment')) return <Building2 size={size} strokeWidth={1.5} />;
  if (lower.includes('shop') || lower.includes('commercial')) return <Store size={size} strokeWidth={1.5} />;
  if (lower.includes('land')) return <Mountain size={size} strokeWidth={1.5} />;
  if (lower.includes('rent')) return <Key size={size} strokeWidth={1.5} />;
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
  'Rent': 'भाड्याने'
};

export default function CategoryGrid({ propertyTypes, lang = 'mr' }: { propertyTypes: PropertyType[], lang?: string }) {
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const toggleParent = (id: string) => {
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const parentCategories = propertyTypes.filter(type => type.parentId === null);
  const getChildren = (parentId: string) => propertyTypes.filter(type => type.parentId === parentId);

  return (
    <div className="mv-category-grid">
      {parentCategories.map((parent) => {
        const children = getChildren(parent.id);
        const hasChildren = children.length > 0;
        const isExpanded = expandedParents[parent.id];
        const displayName = lang === 'mr' ? (marathiCategoryMap[parent.name] || parent.name) : parent.name;

        return (
          <React.Fragment key={parent.id}>
            {hasChildren ? (
              <div
                onClick={() => toggleParent(parent.id)}
                className="mv-category-card"
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  border: isExpanded ? '1px solid rgba(245, 197, 24, 0.5)' : undefined,
                  zIndex: isExpanded ? 50 : 1
                }}
              >
                <div className="mv-category-icon">
                  {getCategoryIcon(parent.name)}
                </div>
                <span className="mv-category-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  {displayName} {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>

                {isExpanded && (
                  <div
                    className="mv-subcategory-dropdown"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      marginTop: '8px',
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'nowrap',
                      justifyContent: 'flex-start',
                      gap: '6px',
                      zIndex: 50,
                      width: 'max-content',
                      maxWidth: 'calc(100vw - 30px)',
                      overflowX: 'auto',
                      paddingBottom: '8px', /* Extra space so the scrollbar doesn't clip the shadow */
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none', /* Hide scrollbar Firefox */
                      msOverflowStyle: 'none', /* Hide scrollbar IE/Edge */
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <style>{`
                      .mv-subcategory-dropdown::-webkit-scrollbar {
                        display: none;
                      }
                    `}</style>
                    {children.map(child => {
                      const childName = child.name.replace(/rent\s*-\s*/i, '').replace(/rent/i, '').trim();
                      const childDisplayName = lang === 'mr' ? (marathiCategoryMap[childName] || childName) : childName;
                      return (
                      <Link
                        key={child.id}
                        href={`/properties?type=${child.id}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          background: 'linear-gradient(135deg, var(--mv-accent, #f5c518), #d49a00)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '10px',
                          padding: '6px 8px',
                          color: '#000000',
                          textDecoration: 'none',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          boxShadow: '0 6px 16px rgba(245, 197, 24, 0.15), inset 0 2px 2px rgba(255, 255, 255, 0.4)',
                          minWidth: '50px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                          e.currentTarget.style.background = 'linear-gradient(135deg, #ffd700, #f5c518)';
                          e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(245, 197, 24, 0.5), 0 0 15px rgba(245, 197, 24, 0.3), inset 0 2px 3px rgba(255, 255, 255, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                          e.currentTarget.style.background = 'linear-gradient(135deg, var(--mv-accent, #f5c518), #d49a00)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 197, 24, 0.15), inset 0 2px 2px rgba(255, 255, 255, 0.4)';
                        }}
                      >
                        <div style={{ color: '#000000' }}>
                          {getCategoryIcon(child.name, 16)}
                        </div>
                        <span>{childDisplayName}</span>
                      </Link>
                    )})}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/properties?type=${parent.id}`}
                className="mv-category-card"
              >
                <div className="mv-category-icon">
                  {getCategoryIcon(parent.name)}
                </div>
                <span className="mv-category-title">
                  {displayName}
                </span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
