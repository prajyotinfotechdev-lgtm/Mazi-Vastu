'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { t } from '@/lib/i18n/translate';
import type { Language } from '@/lib/i18n/get-language';

interface LeadFormProps {
  source: string;
  referenceId?: string;
  visitorInfo?: { name: string; phone: string; email: string };
  lang?: Language;
}

export default function LeadForm({ source, referenceId, visitorInfo, lang = 'en' }: LeadFormProps) {
  const [formData, setFormData] = useState({ 
    name: visitorInfo?.name || '', 
    phone: visitorInfo?.phone || '', 
    email: visitorInfo?.email || '', 
    message: '',
    propertyType: '',
    location: ''
  });
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatus('LOADING');

    try {
      const res = await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source, referenceId })
      });

      if (!res.ok) throw new Error('Failed to submit');
      
      setStatus('SUCCESS');
      if (!visitorInfo) {
        setFormData({ name: '', phone: '', email: '', message: '', propertyType: '', location: '' });
      } else {
        setFormData(p => ({ ...p, message: '' }));
      }
    } catch (error) {
      setStatus('ERROR');
    }
  };

  if (status === 'SUCCESS') {
    return (
      <div className="mv-success-box">
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 700 }}>
          {t('form.lead.successTitle', lang)}, {visitorInfo?.name.split(' ')[0] || ''}!
        </h4>
        <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
          {t('form.lead.successDesc', lang)}
        </p>
      </div>
    );
  }

  // If visitor is registered, just show Express Interest
  if (visitorInfo) {
    return (
      <div>
        <p style={{ color: 'var(--mv-text-secondary)', marginBottom: '1.25rem', fontSize: '0.9375rem', lineHeight: 1.6 }}>
          {t('form.lead.exploringAs1', lang)} <strong style={{ color: 'var(--mv-text)' }}>{visitorInfo.name}</strong>{t('form.lead.exploringAs2', lang)}
        </p>
        {status === 'ERROR' && (
          <div className="mv-error-box" style={{ marginBottom: '1rem' }}>
            {t('form.lead.error', lang)}
          </div>
        )}
        <button 
          onClick={() => handleSubmit()} 
          disabled={status === 'LOADING'}
          className="mv-btn mv-btn-primary mv-btn-lg"
          style={{ width: '100%' }}
        >
          <Send size={18} />
          {status === 'LOADING' ? t('form.lead.sending', lang) : t('form.lead.expressInterest', lang)}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {status === 'ERROR' && (
        <div className="mv-error-box">{t('form.lead.error', lang)}</div>
      )}

      <div>
        <label className="mv-label-text">{t('form.lead.nameLabel', lang)} <span style={{ color: '#ef4444' }}>*</span></label>
        <input type="text" required className="mv-input" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
      </div>
      <div>
        <label className="mv-label-text">{t('form.lead.phoneLabel', lang)} <span style={{ color: '#ef4444' }}>*</span></label>
        <input type="tel" required className="mv-input" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
      </div>
      <div>
        <label className="mv-label-text">{lang === 'mr' ? 'मालमत्तेचा प्रकार' : 'Property Type'} <span style={{ color: '#ef4444' }}>*</span></label>
        <select
          required
          className="mv-input"
          value={formData.propertyType}
          onChange={e => setFormData(p => ({ ...p, propertyType: e.target.value }))}
          style={{ appearance: 'auto' }}
        >
          <option value="">{lang === 'mr' ? 'प्रकार निवडा' : 'Select type'}</option>
          <option value="Residential Plot">{lang === 'mr' ? 'निवासी भूखंड' : 'Residential Plot'}</option>
          <option value="Flat / Apartment">{lang === 'mr' ? 'फ्लॅट / अपार्टमेंट' : 'Flat / Apartment'}</option>
          <option value="Independent House">{lang === 'mr' ? 'स्वतंत्र घर' : 'Independent House'}</option>
          <option value="Commercial">{lang === 'mr' ? 'व्यावसायिक' : 'Commercial'}</option>
          <option value="Agricultural Land">{lang === 'mr' ? 'शेतजमीन' : 'Agricultural Land'}</option>
          <option value="Other">{lang === 'mr' ? 'इतर' : 'Other'}</option>
        </select>
      </div>
      <div>
        <label className="mv-label-text">{lang === 'mr' ? 'स्थान' : 'Location'} <span style={{ color: '#ef4444' }}>*</span></label>
        <input
          type="text"
          required
          className="mv-input"
          value={formData.location}
          onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
          placeholder={lang === 'mr' ? 'उदा. पुणे, नाशिक' : 'e.g. Pune, Nashik'}
        />
      </div>
      <div>
        <label className="mv-label-text">{lang === 'mr' ? 'बजेट (पर्यायी)' : 'Budget (Optional)'}</label>
        <input type="text" className="mv-input" value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))} placeholder={lang === 'mr' ? 'उदा. ५० लाख' : 'e.g. 50 Lacs'} />
      </div>
      
      <button type="submit" disabled={status === 'LOADING'} className="mv-btn mv-btn-primary mv-btn-lg" style={{ width: '100%' }}>
        <Send size={18} />
        {status === 'LOADING' ? t('form.lead.sending', lang) : t('form.lead.requestDetails', lang)}
      </button>
    </form>
  );
}
