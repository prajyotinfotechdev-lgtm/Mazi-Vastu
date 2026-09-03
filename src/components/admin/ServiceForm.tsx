'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useLoader } from '@/components/providers/LoaderProvider';
import MediaUploader, { UploadedMedia } from './MediaUploader';

interface ServiceFormProps {
  initialData?: any;
}

export default function ServiceForm({ initialData }: ServiceFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const { showLoader, hideLoader } = useLoader();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    priceUnit: initialData?.priceUnit || '',
    whatsappNumber: initialData?.whatsappNumber || '',
    whatsappMessageTemplate: initialData?.whatsappMessageTemplate || 'Hello, I would like to avail the {serviceName} service (Listed Price: {price}). My name is {userName}.',
    whatsappMessageTemplate: initialData?.whatsappMessageTemplate || 'Hello, I would like to avail the {serviceName} service (Listed Price: {price}). My name is {userName}.',
  });
  
  const [providerContacts, setProviderContacts] = useState<{name: string, number: string}[]>(() => {
    if (!initialData?.providerContacts) return [];
    try {
      return typeof initialData.providerContacts === 'string' 
        ? JSON.parse(initialData.providerContacts) 
        : initialData.providerContacts;
    } catch {
      return [];
    }
  });
  
  const [iconUrl, setIconUrl] = useState<string>(initialData?.iconUrl || '');
  const [mediaItems, setMediaItems] = useState<UploadedMedia[]>(
    initialData?.iconUrl ? [{ publicId: 'service_icon', publicUrl: initialData.iconUrl, mediaType: 'IMAGE', mimeType: 'image/jpeg' }] : []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (index: number, field: 'name' | 'number', value: string) => {
    setProviderContacts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddContact = () => {
    setProviderContacts(prev => [...prev, { name: '', number: '' }]);
  };

  const handleRemoveContact = (index: number) => {
    setProviderContacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showLoader(isEdit ? 'Updating Service...' : 'Creating Service...');
    setError('');

    try {
      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
        iconUrl: iconUrl || null,
        providerContacts: providerContacts.filter(c => c.name.trim() && c.number.trim()),
        isActive: true,
      };

      const url = isEdit ? `/api/admin/services/${initialData.id}` : '/api/admin/services';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || `Failed to ${isEdit ? 'update' : 'create'} service`);
      }

      toast.success(`Service ${isEdit ? 'updated' : 'created'} successfully!`);
      router.push('/admin/services');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  return (
    <>
      <style>{`
        .premium-form-card {
          background: var(--mv-bg-surface);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        
        .form-section {
          padding: 2rem 2.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .form-section:last-child {
          border-bottom: none;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f5c518;
          margin: 0 0 1.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        .premium-label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--mv-text-secondary);
          margin-bottom: 0.5rem;
          transition: color 0.2s ease;
        }
        
        .premium-input, .premium-textarea {
          width: 100%;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: var(--mv-text);
          padding: 1rem 1.25rem;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .premium-input:focus, .premium-textarea:focus {
          outline: none;
          border-color: #f5c518;
          background: rgba(0,0,0,0.3);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 0 0 3px rgba(245, 197, 24, 0.2);
        }
        
        .premium-textarea {
          resize: vertical;
          min-height: 120px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        .media-uploader-wrapper {
          background: rgba(0,0,0,0.2);
          border: 1px dashed rgba(255,255,255,0.2);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        .media-uploader-wrapper:hover {
          border-color: rgba(245, 197, 24, 0.5);
          background: rgba(0,0,0,0.3);
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem 2.5rem;
          background: rgba(0,0,0,0.2);
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        
        .btn-cancel {
          padding: 0.875rem 1.75rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: var(--mv-text-secondary);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .btn-cancel:hover {
          background: rgba(255,255,255,0.05);
          color: var(--mv-text);
          border-color: rgba(255,255,255,0.2);
        }
        
        .btn-submit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #f5c518 0%, #d4a000 100%);
          color: #0f172a;
          padding: 0.875rem 2rem;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(245, 197, 24, 0.3);
        }
        .btn-submit:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(245, 197, 24, 0.5);
          background: linear-gradient(135deg, #ffd740 0%, #e6b800 100%);
        }
        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }
        
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          margin: 1.5rem 2.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
      `}</style>
      <form onSubmit={handleSubmit} className="premium-form-card">
        {error && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        <div className="form-section">
          <h3 className="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Basic Details
          </h3>
          
          <div className="form-group">
            <label className="premium-label">Service Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="premium-input"
              placeholder="e.g. Premium Landscaping"
            />
          </div>

          <div className="form-group">
            <label className="premium-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="premium-textarea"
              placeholder="Describe the elite service offering..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="premium-label">Price (Amount)</label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="premium-input"
                placeholder="e.g. 5000"
              />
            </div>
            <div className="form-group">
              <label className="premium-label">Price Unit (Optional)</label>
              <input
                type="text"
                name="priceUnit"
                value={formData.priceUnit}
                onChange={handleChange}
                className="premium-input"
                placeholder="e.g. per visit, per sqft"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            Service Media
          </h3>
          <div className="form-group">
            <label className="premium-label">Service Cover/Icon</label>
            <div className="media-uploader-wrapper" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <MediaUploader
                  onMediaUploaded={(newMedia) => {
                    setMediaItems(newMedia);
                    if (newMedia.length > 0) {
                      setIconUrl(newMedia[0].publicUrl);
                    } else {
                      setIconUrl('');
                    }
                  }}
                />
              </div>
              {iconUrl && (
                <div style={{ 
                  width: '180px', 
                  height: '180px', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  border: '2px solid rgba(245, 197, 24, 0.3)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  flexShrink: 0,
                  position: 'relative'
                }}>
                  <img src={iconUrl} alt="Service Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>
                    Current Image
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            WhatsApp Routing
          </h3>
          
          <div className="form-group">
            <label className="premium-label">Admin WhatsApp Number *</label>
            <input
              type="text"
              name="whatsappNumber"
              required
              value={formData.whatsappNumber}
              onChange={handleChange}
              className="premium-input"
              placeholder="e.g. 919876543210 (Country code, no +)"
            />
          </div>

          <div className="form-group">
            <label className="premium-label">Message Template</label>
            <textarea
              name="whatsappMessageTemplate"
              required
              value={formData.whatsappMessageTemplate}
              onChange={handleChange}
              className="premium-textarea"
              style={{ fontFamily: 'monospace', minHeight: '100px' }}
            />
            <p style={{ fontSize: '0.85rem', color: 'var(--mv-text-muted)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              Available variables: <code>{'{serviceName}'}</code>, <code>{'{price}'}</code>, <code>{'{userName}'}</code>
            </p>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
              Provider Details (Optional)
            </div>
            <button type="button" onClick={handleAddContact} style={{
              background: 'rgba(245, 197, 24, 0.1)',
              color: '#f5c518',
              border: '1px solid rgba(245, 197, 24, 0.2)',
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'all 0.2s'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Contact
            </button>
          </h3>
          
          {providerContacts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', color: 'var(--mv-text-muted)', fontSize: '0.9rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
              No provider contacts added. Click "Add Contact" to assign providers to this service.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {providerContacts.map((contact, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ flex: 1 }}>
                  <label className="premium-label">Provider Name</label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={e => handleContactChange(idx, 'name', e.target.value)}
                    className="premium-input"
                    placeholder="e.g. Ramesh Plumbing Co."
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="premium-label">Provider Number</label>
                  <input
                    type="text"
                    value={contact.number}
                    onChange={e => handleContactChange(idx, 'number', e.target.value)}
                    className="premium-input"
                    placeholder="e.g. 9876543210"
                  />
                </div>
                <button type="button" onClick={() => handleRemoveContact(idx)} style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginTop: '1.5rem',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }} title="Remove Contact">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <Link href="/admin/services" className="btn-cancel">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-submit">
            <Save size={18} />
            {loading ? 'Saving Changes...' : (isEdit ? 'Update Service' : 'Create Service')}
          </button>
        </div>
      </form>
    </>
  );
}
