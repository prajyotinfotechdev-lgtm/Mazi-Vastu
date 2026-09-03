'use client';

import { useState } from 'react';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

interface ServiceInquiryFormProps {
  serviceId: string;
  serviceName: string;
}

export default function ServiceInquiryForm({ serviceId, serviceName }: ServiceInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'SERVICE_CONTACT',
          referenceId: serviceId
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Failed to submit inquiry');
      }

      setStatus('success');
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (status === 'success') {
    return (
      <div className="mv-success-box">
        <CheckCircle2 size={48} color="#4ade80" style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Request Received!</h3>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Thank you for your interest in {serviceName}. Our team will contact you shortly on the provided phone number.
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="mv-btn mv-btn-accent-outline"
          style={{ marginTop: '1.5rem' }}
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="mv-card" style={{ padding: '2rem' }}>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--mv-text)', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
        Request this Service
      </h3>
      <p style={{ color: 'var(--mv-text-muted)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
        Fill out the form below and our <span className="mv-accent-text">{serviceName}</span> experts will get in touch with you.
      </p>

      {status === 'error' && (
        <div className="mv-error-box" style={{ marginBottom: '1.5rem' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="mv-label-text">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
          <input 
            type="text" 
            name="name" 
            required 
            className="mv-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="mv-label-text">Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
          <input 
            type="tel" 
            name="phone" 
            required 
            className="mv-input"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
          />
        </div>

        <div>
          <label className="mv-label-text">Email Address <span style={{ color: 'var(--mv-text-muted)', fontWeight: 400 }}>(Optional)</span></label>
          <input 
            type="email" 
            name="email" 
            className="mv-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="mv-label-text">Additional Message <span style={{ color: 'var(--mv-text-muted)', fontWeight: 400 }}>(Optional)</span></label>
          <textarea 
            name="message" 
            className="mv-textarea"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us what you need help with..."
          />
        </div>

        <button 
          type="submit" 
          disabled={status === 'loading'}
          className="mv-btn mv-btn-primary mv-btn-lg"
          style={{ marginTop: '0.5rem', width: '100%' }}
        >
          {status === 'loading' ? <Loader2 size={20} className="mv-spinner" /> : <Send size={20} />}
          Submit Inquiry
        </button>
      </form>
    </div>
  );
}
