'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Info, User, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import MediaUploader, { UploadedMedia } from './MediaUploader';

interface AdvertisementFormProps {
  initialData?: any;
}

export default function AdvertisementForm({ initialData }: AdvertisementFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    projectInformation: initialData?.projectInformation || '',
    contactName: initialData?.contactName || '',
    contactPhone: initialData?.contactPhone || '',
    contactEmail: initialData?.contactEmail || '',
    status: initialData?.status || 'DRAFT',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
  });

  // Media State
  const [media, setMedia] = useState<UploadedMedia[]>(initialData?.media || []);
  
  // Placements State
  const [placements, setPlacements] = useState<string[]>(
    initialData?.placements?.map((p: any) => p.placementZone) || []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        media,
      };

      const url = isEdit ? `/api/admin/advertisements/${initialData.id}` : '/api/admin/advertisements';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || `Failed to ${isEdit ? 'update' : 'create'} advertisement`);
      }

      const savedAd = await res.json();
      const adId = isEdit ? initialData.id : savedAd.id;

      // Assign placements
      if (placements.length > 0) {
        const placementsPayload = {
          placements: placements.map(p => ({ placementZone: p, sortOrder: 0 }))
        };
        const placementRes = await fetch(`/api/admin/advertisements/${adId}/placements`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(placementsPayload),
        });
        if (!placementRes.ok) {
           console.error("Failed to assign placements");
        }
      }

      toast.success(`Advertisement ${isEdit ? 'updated' : 'created'} successfully!`);
      router.push('/admin/advertisements');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (name: string) => ({
    width: '100%',
    padding: '0.875rem 1rem',
    border: focusedField === name ? '1px solid var(--mv-accent)' : '1px solid var(--mv-border)',
    borderRadius: '8px',
    outline: 'none',
    background: 'rgba(255, 255, 255, 0.03)',
    color: 'var(--mv-text)',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    boxShadow: focusedField === name ? '0 0 0 3px rgba(245, 197, 24, 0.1)' : 'none'
  });

  const getLabelStyle = () => ({
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 500,
    marginBottom: '0.5rem',
    color: 'var(--mv-text-secondary)',
    letterSpacing: '0.01em'
  });

  const SectionHeader = ({ title, description, icon: Icon }: { title: string, description: string, icon: any }) => (
    <div style={{ flex: '1 1 300px', maxWidth: '350px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 197, 24, 0.1)', color: 'var(--mv-accent)' }}>
          <Icon size={18} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--mv-text)', margin: 0 }}>
          {title}
        </h3>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--mv-text-secondary)', lineHeight: 1.6, margin: 0 }}>
        {description}
      </p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <Info size={20} />
          <span style={{ fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {/* 1. Base Details */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <SectionHeader 
          title="Advertisement Details" 
          description="Provide the core details of the campaign, including timeline and visibility status."
          icon={Info}
        />
        <div className="mv-card" style={{ flex: '2 1 500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--mv-bg-elevated)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={getLabelStyle()}>
                Ad Title / Campaign Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('title')}
                placeholder="e.g., Summer Bonanza Sale"
              />
            </div>

            <div>
              <label style={getLabelStyle()}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                onFocus={() => setFocusedField('status')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('status')}
              >
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="ACTIVE">Active (Live)</option>
                <option value="INACTIVE">Inactive (Paused)</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={getLabelStyle()}>Placement Zones</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                {['HOMEPAGE_BANNER', 'CATEGORY_PAGE_SLOT', 'SERVICE_PAGE_SLOT', 'FOOTER_STRIP'].map(zone => (
                  <label key={zone} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--mv-text)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={placements.includes(zone)}
                      onChange={(e) => {
                        if (e.target.checked) setPlacements([...placements, zone]);
                        else setPlacements(placements.filter(p => p !== zone));
                      }}
                      style={{ accentColor: 'var(--mv-accent)' }}
                    />
                    {zone.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={getLabelStyle()}>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                onFocus={() => setFocusedField('startDate')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('startDate')}
              />
            </div>
            
            <div>
              <label style={getLabelStyle()}>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                onFocus={() => setFocusedField('endDate')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('endDate')}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={getLabelStyle()}>Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                onFocus={() => setFocusedField('description')}
                onBlur={() => setFocusedField(null)}
                style={{ ...getInputStyle('description'), resize: 'vertical' }}
                placeholder="Short marketing copy..."
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={getLabelStyle()}>Project Information (Optional)</label>
              <textarea
                name="projectInformation"
                rows={3}
                value={formData.projectInformation}
                onChange={handleChange}
                onFocus={() => setFocusedField('projectInformation')}
                onBlur={() => setFocusedField(null)}
                style={{ ...getInputStyle('projectInformation'), resize: 'vertical' }}
                placeholder="Detailed info about the promoted project..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Contact Info */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <SectionHeader 
          title="Lead Contact Info" 
          description="Specify who should be contacted when a lead clicks or submits an inquiry for this ad."
          icon={User}
        />
        <div className="mv-card" style={{ flex: '2 1 500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--mv-bg-elevated)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label style={getLabelStyle()}>Contact Name</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                onFocus={() => setFocusedField('contactName')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('contactName')}
                placeholder="e.g. Sales Team"
              />
            </div>
            <div>
              <label style={getLabelStyle()}>Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                onFocus={() => setFocusedField('contactPhone')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('contactPhone')}
                placeholder="e.g. 9876543210"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={getLabelStyle()}>Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                onFocus={() => setFocusedField('contactEmail')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('contactEmail')}
                placeholder="e.g. sales@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Media Upload */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <SectionHeader 
          title="Campaign Media" 
          description="Upload eye-catching banners, promotional images, or videos for this advertisement."
          icon={ImageIcon}
        />
        <div className="mv-card" style={{ flex: '2 1 500px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--mv-bg-elevated)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          {isEdit && (
            <div style={{ fontSize: '0.875rem', color: 'var(--mv-text-secondary)', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Info size={16} style={{ color: 'var(--mv-accent)' }} />
              <span><strong>Note:</strong> Currently, editing media requires re-uploading the images. They will replace the existing ones.</span>
            </div>
          )}
          <MediaUploader onMediaUploaded={(uploadedMedia) => setMedia(uploadedMedia)} />
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{ 
        position: 'sticky', 
        bottom: 0, 
        padding: '1.5rem', 
        background: 'rgba(12, 12, 12, 0.8)', 
        backdropFilter: 'blur(12px)', 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', 
        justifyContent: 'flex-end',
        gap: '1rem',
        margin: '0 -2rem',
        zIndex: 10
      }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 1.5rem',
            background: 'transparent',
            border: '1px solid var(--mv-border)',
            borderRadius: '8px',
            color: 'var(--mv-text)',
            fontSize: '0.95rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--mv-border)'; }}
        >
          <ArrowLeft size={18} />
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--mv-accent)',
            color: '#1a1a1a',
            padding: '0.875rem 2.5rem',
            borderRadius: '8px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 20px rgba(245, 197, 24, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 6px 24px rgba(245, 197, 24, 0.4)')}
          onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 197, 24, 0.3)')}
        >
          <Save size={20} />
          {loading ? 'Saving...' : (isEdit ? 'Update Advertisement' : 'Save Advertisement')}
        </button>
      </div>

    </form>
  );
}
