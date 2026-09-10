'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle, Lock, Unlock, ShieldCheck, ArrowRight } from 'lucide-react';
import { t } from '@/lib/i18n/translate';
import type { Language } from '@/lib/i18n/get-language';

interface ServiceRequestModalProps {
  service: {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    priceUnit: string | null;
    providerContacts?: any;
  };
  isRegistered: boolean;
  onClose: () => void;
  lang?: Language;
}

export default function ServiceRequestModal({ service, isRegistered, onClose, lang = 'en' }: ServiceRequestModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="mv-modal-overlay">
      <div className="mv-modal-content">
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mv-text-muted)' }}>
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--mv-text)', margin: '0 0 0.5rem 0', fontFamily: 'Outfit, sans-serif' }}>
          {t('form.service.getService', lang) || 'Provider Details'}
        </h2>
        <p style={{ color: 'var(--mv-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          <>{t('form.service.requesting1', lang)} <strong style={{ color: 'var(--mv-accent)' }}>{service.name}</strong> {t('form.service.requesting2', lang)}</>
        </p>

        {service.price && (
          <div style={{
            background: 'var(--mv-bg-surface)',
            padding: '1rem',
            borderRadius: 'var(--mv-radius-sm)',
            marginBottom: '1.5rem',
            border: '1px solid var(--mv-border)',
          }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--mv-text-muted)', fontWeight: 500 }}>{t('form.service.estimatedAmount', lang)}</div>
            <div className="mv-price" style={{ fontSize: '1.375rem' }}>
              ₹{service.price} {service.priceUnit && <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--mv-text-muted)' }}>{service.priceUnit}</span>}
            </div>
          </div>
        )}

        {/* Always show details, removed lock screen */}
        <>
          {(() => {
            let contacts = [];
            if (typeof service.providerContacts === 'string') {
              try { contacts = JSON.parse(service.providerContacts); } catch (e) { }
            } else if (Array.isArray(service.providerContacts)) {
              contacts = service.providerContacts;
            }

            return contacts.length > 0 ? (
              <div style={{
                marginTop: '1rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--mv-text-muted)', fontWeight: 500, marginBottom: '0.75rem' }}>
                  Providers for this service
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {contacts.map((contact: any, index: number) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'var(--mv-bg-surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--mv-border)'
                    }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '4px', background: 'var(--mv-bg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        {contact.photoUrl ? (
                          <img src={contact.photoUrl} alt={contact.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--mv-text-muted)' }}>
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--mv-text)' }}>
                          {contact.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--mv-text-muted)', marginTop: '2px' }}>
                          {contact.number}
                        </div>
                      </div>
                      
                      <a href={`tel:${contact.number}`} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '4px',
                        background: 'rgba(245, 197, 24, 0.1)',
                        color: 'var(--mv-accent)',
                        textDecoration: 'none'
                      }}
                        title={`Call ${contact.number}`}>
                        <MessageCircle size={18} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--mv-text-muted)' }}>
                No providers have been listed for this service yet.
              </div>
            );
          })()}
          <button onClick={onClose} className="mv-btn mv-btn-primary mv-btn-lg" style={{ width: '100%' }}>
            Done
          </button>
        </>
      </div>
    </div>,
    document.body
  );
}
