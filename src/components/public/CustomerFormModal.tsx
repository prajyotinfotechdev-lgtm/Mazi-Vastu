'use client';

import { useState } from 'react';
import LeadForm from './LeadForm';
import { X } from 'lucide-react';
import type { Language } from '@/lib/i18n/get-language';

export default function CustomerFormModal({ lang }: { lang: Language }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="mv-customer-form-wrapper">
        <button 
          onClick={() => setIsOpen(true)}
          className="mv-customer-form-btn"
        >
          Customer Form
        </button>
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--mv-bg)',
            border: '1px solid var(--mv-border)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--mv-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>Customer Form</h3>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--mv-text)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <LeadForm source="HOMEPAGE_CUSTOMER_FORM" lang={lang} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
