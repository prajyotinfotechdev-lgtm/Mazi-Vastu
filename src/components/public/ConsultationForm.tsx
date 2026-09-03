'use client';

import { useState } from 'react';
import { Send, Loader2, User, Phone, Mail, Building, MapPin, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Language } from '@/lib/i18n/get-language';

interface ConsultationFormProps {
  lang?: Language;
}

const tr: Record<string, Record<string, string>> = {
  en: {
    name: 'Your Name *',
    phone: 'Phone Number *',
    email: 'Email Address',
    type: 'Property Type',
    location: 'Preferred Location',
    budget: 'Budget',
    submit: 'Request Consultation',
    sending: 'Sending...',
    success: 'Thank you! Your consultation request has been submitted successfully.',
    error: 'Failed to submit. Please check your details and try again.'
  },
  mr: {
    name: 'तुमचे नाव *',
    phone: 'फोन नंबर *',
    email: 'ईमेल पत्ता',
    type: 'मालमत्तेचा प्रकार',
    location: 'पसंतीचे ठिकाण',
    budget: 'बजेट',
    submit: 'सल्लामसलत करण्याची विनंती करा',
    sending: 'पाठवत आहे...',
    success: 'धन्यवाद! तुमची सल्लामसलत करण्याची विनंती यशस्वीरित्या सबमिट केली गेली आहे.',
    error: 'सबमिट करण्यात अयशस्वी. कृपया तुमचे तपशील तपासा आणि पुन्हा प्रयत्न करा.'
  }
};

export default function ConsultationForm({ lang = 'en' }: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    wantedPropertyType: '',
    wantedPropertyLocation: '',
    budget: ''
  });
  
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const t = tr[lang] || tr.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('LOADING');

    try {
      const res = await fetch('/api/public/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to submit');
      
      setStatus('IDLE');
      toast.success(t.success);
      setFormData({ name: '', phone: '', email: '', wantedPropertyType: '', wantedPropertyLocation: '', budget: '' });
    } catch (error) {
      setStatus('IDLE');
      toast.error(t.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <style>{`
        .premium-input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .premium-input-icon {
          position: absolute;
          left: 16px;
          color: var(--mv-text-muted);
          transition: color 0.3s ease;
          pointer-events: none;
        }
        .premium-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px 16px 16px 48px;
          color: var(--mv-text);
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--mv-accent);
          box-shadow: 0 0 0 4px rgba(245, 197, 24, 0.1);
        }
        .premium-input:focus + .premium-input-icon {
          color: var(--mv-accent);
        }
        .premium-label {
          position: absolute;
          left: 48px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--mv-text-muted);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          font-size: 1rem;
        }
        .premium-input:focus ~ .premium-label,
        .premium-input:not(:placeholder-shown) ~ .premium-label {
          top: -10px;
          left: 12px;
          font-size: 0.75rem;
          background: var(--mv-bg-elevated);
          padding: 0 8px;
          color: var(--mv-accent);
          border-radius: 4px;
        }
        .premium-submit-btn {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--mv-accent) 0%, #e5a900 100%);
          color: #000;
          font-weight: 700;
          font-size: 1.125rem;
          border: none;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(245, 197, 24, 0.3);
        }
        .premium-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(245, 197, 24, 0.4);
        }
        .premium-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .premium-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 'clamp(1rem, 3vw, 2rem)' }}>
        <div className="premium-input-group">
          <input 
            type="text" required className="premium-input" placeholder=" "
            value={formData.name} 
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} 
            id="name-input"
          />
          <User size={20} className="premium-input-icon" />
          <label htmlFor="name-input" className="premium-label">{t.name}</label>
        </div>
        <div className="premium-input-group">
          <input 
            type="tel" required pattern="[6-9][0-9]{9}" className="premium-input" placeholder=" "
            value={formData.phone} 
            onChange={e => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} 
            id="phone-input"
          />
          <Phone size={20} className="premium-input-icon" />
          <label htmlFor="phone-input" className="premium-label">{t.phone}</label>
        </div>
      </div>

      <div className="premium-input-group">
        <input 
          type="email" className="premium-input" placeholder=" "
          value={formData.email} 
          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} 
          id="email-input"
        />
        <Mail size={20} className="premium-input-icon" />
        <label htmlFor="email-input" className="premium-label">{t.email}</label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 'clamp(1rem, 3vw, 2rem)' }}>
        <div className="premium-input-group">
          <input 
            type="text" className="premium-input" placeholder=" "
            value={formData.wantedPropertyType} 
            onChange={e => setFormData(p => ({ ...p, wantedPropertyType: e.target.value }))} 
            id="type-input"
          />
          <Building size={20} className="premium-input-icon" />
          <label htmlFor="type-input" className="premium-label">{t.type}</label>
        </div>
        <div className="premium-input-group">
          <input 
            type="text" className="premium-input" placeholder=" "
            value={formData.wantedPropertyLocation} 
            onChange={e => setFormData(p => ({ ...p, wantedPropertyLocation: e.target.value }))} 
            id="loc-input"
          />
          <MapPin size={20} className="premium-input-icon" />
          <label htmlFor="loc-input" className="premium-label">{t.location}</label>
        </div>
      </div>

      <div className="premium-input-group">
        <input 
          type="text" className="premium-input" placeholder=" "
          value={formData.budget} 
          onChange={e => setFormData(p => ({ ...p, budget: e.target.value }))} 
          id="budget-input"
        />
        <IndianRupee size={20} className="premium-input-icon" />
        <label htmlFor="budget-input" className="premium-label">{t.budget}</label>
      </div>

      <button 
        type="submit" 
        disabled={status === 'LOADING'} 
        className="premium-submit-btn"
        style={{ marginTop: '1rem' }}
      >
        {status === 'LOADING' ? <Loader2 size={24} className="mv-spinner" /> : <Send size={24} />}
        {status === 'LOADING' ? t.sending : t.submit}
      </button>
    </form>
  );
}
