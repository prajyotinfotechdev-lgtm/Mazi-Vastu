'use client';

import { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAccess, setHasAccess] = useState(isRegistered);

  useEffect(() => {
    if (!isRegistered && typeof window !== 'undefined') {
      const hasProvided = localStorage.getItem('mv_service_contact_provided');
      if (hasProvided === 'true') {
        setHasAccess(true);
      }
    }
  }, [isRegistered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/public/services/${service.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, phone: formData.mobile }),
      });

      if (!res.ok) {
        throw new Error('Failed to initiate contact request');
      }

      const data = await res.json();
      
      if (data.success) {
        setHasAccess(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('mv_service_contact_provided', 'true');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="mv-modal-overlay">
      <div className="mv-modal-content">
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mv-text-muted)' }}>
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--mv-text)', margin: '0 0 0.5rem 0', fontFamily: 'Outfit, sans-serif' }}>
          {hasAccess ? t('form.service.getService', lang) : 'Unlock Provider Details'}
        </h2>
        <p style={{ color: 'var(--mv-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {hasAccess 
            ? <>{t('form.service.requesting1', lang)} <strong style={{ color: 'var(--mv-accent)' }}>{service.name}</strong> {t('form.service.requesting2', lang)}</>
            : <>Please enter your details once to unlock contact numbers for <strong style={{ color: 'var(--mv-accent)' }}>{service.name}</strong> and all other services.</>
          }
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

        {hasAccess ? (
          <>
            {(() => {
              let contacts = [];
              if (typeof service.providerContacts === 'string') {
                try { contacts = JSON.parse(service.providerContacts); } catch (e) {}
              } else if (Array.isArray(service.providerContacts)) {
                contacts = service.providerContacts;
              }
              
              return contacts.length > 0 ? (
                <div style={{
                  background: 'linear-gradient(145deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.8) 100%)',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(245, 197, 24, 0.3)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#f5c518', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <ShieldCheck size={16} /> Verified Providers
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {contacts.map((contact: any, index: number) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        paddingBottom: index < contacts.length - 1 ? '1rem' : '0', 
                        borderBottom: index < contacts.length - 1 ? '1px dashed rgba(255,255,255,0.1)' : 'none' 
                      }}>
                        <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--mv-text)' }}>
                          {contact.name}
                        </div>
                        <a href={`tel:${contact.number}`} style={{ 
                          fontSize: '0.95rem', 
                          color: '#f5c518', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.4rem',
                          textDecoration: 'none',
                          background: 'rgba(245,197,24,0.1)',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '20px',
                          fontWeight: 600,
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(245,197,24,0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(245,197,24,0.1)'}>
                          <MessageCircle size={15} /> {contact.number}
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
        ) : (
          <>
            {/* The Lock Screen Form */}
            {error && <div className="mv-error-box" style={{ marginBottom: '1rem' }}>{error}</div>}

            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px dashed rgba(255,255,255,0.1)',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              <Lock size={32} color="var(--mv-text-muted)" style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <div style={{ fontSize: '0.9rem', color: 'var(--mv-text-secondary)', marginBottom: '0.5rem' }}>
                Contact details are locked.
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--mv-text-muted)' }}>
                Provide your details below to permanently unlock contact numbers across the site.
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="mv-label-text">{t('form.lead.nameLabel', lang)} *</label>
                <input
                  type="text" required className="mv-input"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('form.service.namePlaceholder', lang)}
                />
              </div>

              <div>
                <label className="mv-label-text">{t('form.lead.phoneLabel', lang)} *</label>
                <div style={{ display: 'flex' }}>
                  <div style={{
                    padding: '0.875rem',
                    background: 'var(--mv-bg-surface)',
                    border: '1px solid var(--mv-border)',
                    borderRight: 'none',
                    borderRadius: 'var(--mv-radius-md) 0 0 var(--mv-radius-md)',
                    color: 'var(--mv-text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}>
                    +91
                  </div>
                  <input
                    type="tel" required maxLength={10} className="mv-input"
                    style={{ borderRadius: '0 var(--mv-radius-md) var(--mv-radius-md) 0' }}
                    value={formData.mobile}
                    onChange={e => setFormData(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '') }))}
                    placeholder={t('form.service.phonePlaceholder', lang)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (!formData.name.trim() || formData.mobile.length < 10)}
                className="mv-btn mv-btn-primary mv-btn-lg"
                style={{ width: '100%', marginTop: '0.5rem', background: 'linear-gradient(135deg, #f5c518 0%, #d4a000 100%)', color: '#0f172a' }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Unlocking...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Unlock size={18} /> Unlock Contact Details <ArrowRight size={18} />
                  </span>
                )}
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--mv-text-muted)', margin: 0 }}>
                By unlocking, you allow our team to assist you better. Your data is secure.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
