import React from 'react';
import { Flame, MapPin } from 'lucide-react';

interface UrgentPropertyItem {
  id: string;
  title: string;
  location: string;
  createdAt: Date | string;
}

interface UrgentPropertiesBoxProps {
  urgentProperties: UrgentPropertyItem[];
}

export default function UrgentPropertiesBox({ urgentProperties }: UrgentPropertiesBoxProps) {
  if (!urgentProperties || urgentProperties.length === 0) {
    return null;
  }

  return (
    <section className="container" style={{ margin: '1rem auto 2rem auto', padding: '0 1rem' }}>
      <div className="mv-urgent-container">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            borderBottom: '1px solid #334155',
            paddingBottom: '0.75rem',
          }}
        >
          <Flame size={20} color="#f5c518" />
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              margin: 0,
              color: '#ffffff',
            }}
          >
            Urgent + Rent Property
          </h2>
        </div>

        <ul
          style={{
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {urgentProperties.map((prop) => (
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
      </div>
    </section>
  );
}
