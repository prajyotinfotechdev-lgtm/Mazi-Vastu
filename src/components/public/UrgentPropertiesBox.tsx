'use client';

import React, { useState } from 'react';
import { Flame, MapPin, Key } from 'lucide-react';

interface UrgentPropertyItem {
  id: string;
  title: string;
  location: string;
  type?: string;
  createdAt: Date | string;
}

interface UrgentPropertiesBoxProps {
  urgentProperties: UrgentPropertyItem[];
}

export default function UrgentPropertiesBox({ urgentProperties }: UrgentPropertiesBoxProps) {
  const [activeTab, setActiveTab] = useState<'URGENT' | 'RENT'>('URGENT');
  const [expanded, setExpanded] = useState(false);

  if (!urgentProperties || urgentProperties.length === 0) {
    return null;
  }

  // Filter properties based on the active tab
  const filteredProperties = urgentProperties.filter((prop) => {
    const propType = prop.type || 'URGENT';
    return propType === activeTab;
  });

  const displayProperties = expanded ? filteredProperties : filteredProperties.slice(0, 5);
  const hasMore = filteredProperties.length > 5;

  return (
    <section className="container" style={{ margin: '1rem auto 2rem auto', padding: '0 1rem' }}>
      <div className="mv-urgent-container">
        
        {/* Tabs Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            borderBottom: '1px solid #334155',
          }}
        >
          <button
            onClick={() => { setActiveTab('URGENT'); setExpanded(false); }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: activeTab === 'URGENT' ? '#f5c518' : '#94a3b8',
              borderBottom: activeTab === 'URGENT' ? '2px solid #f5c518' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'URGENT' ? 700 : 500,
              fontSize: '1.1rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Flame size={18} color={activeTab === 'URGENT' ? '#f5c518' : '#94a3b8'} />
            Urgent Property
          </button>

          <button
            onClick={() => { setActiveTab('RENT'); setExpanded(false); }}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: activeTab === 'RENT' ? '#f5c518' : '#94a3b8',
              borderBottom: activeTab === 'RENT' ? '2px solid #f5c518' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'RENT' ? 700 : 500,
              fontSize: '1.1rem',
              transition: 'all 0.2s ease',
            }}
          >
            <Key size={18} color={activeTab === 'RENT' ? '#f5c518' : '#94a3b8'} />
            Rent Property
          </button>
        </div>

        {/* Property List */}
        {filteredProperties.length === 0 ? (
          <div style={{ color: '#94a3b8', padding: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
            No {activeTab === 'URGENT' ? 'urgent' : 'rent'} properties found.
          </div>
        ) : (
          <ul
            style={{
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {displayProperties.map((prop) => (
              <li key={prop.id} className="mv-urgent-item">
                <span style={{ color: '#f5c518', marginTop: '2px' }}>•</span>
                <div className="mv-urgent-item-content">
                  <span style={{ fontWeight: 'bold', color: '#94a3b8', marginRight: '0.5rem' }}>
                    {prop.location}:
                  </span>
                  <span style={{ marginRight: '0.5rem' }}>{prop.title}</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    ({new Date(prop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* See More Button */}
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'rgba(245, 197, 24, 0.1)',
                border: '1px solid rgba(245, 197, 24, 0.2)',
                color: '#f5c518',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245, 197, 24, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(245, 197, 24, 0.1)';
              }}
            >
              {expanded ? 'See Less' : 'See More'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
