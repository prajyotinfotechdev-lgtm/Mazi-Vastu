'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Info, Tag, MapPin, List, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import MediaUploader, { UploadedMedia } from './MediaUploader';

interface PropertyType {
  id: string;
  name: string;
  parentId: string | null;
}

interface NewPropertyFormProps {
  propertyTypes: PropertyType[];
  customFields: any[];
}

export default function NewPropertyForm({ propertyTypes, customFields }: NewPropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Base Field State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyTypeId: '',
    status: 'DRAFT',
    price: '',
    priceType: 'FIXED',
    size: '',
    sizeUnit: 'SQFT',
    approximateLocation: '',
    gatedLocation: '',
  });

  // Dynamic Metadata State
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  
  // Media State
  const [media, setMedia] = useState<UploadedMedia[]>([]);

  // Derived state
  const rootTypes = propertyTypes.filter(pt => !pt.parentId);
  const subTypes = propertyTypes.filter(pt => pt.parentId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMetadataChange = (key: string, value: any) => {
    setMetadata(prev => ({ ...prev, [key]: value }));
  };

  const handleMultiSelectChange = (key: string, option: string, checked: boolean) => {
    setMetadata(prev => {
      const current = prev[key] || [];
      if (checked) {
        return { ...prev, [key]: [...current, option] };
      } else {
        return { ...prev, [key]: current.filter((o: string) => o !== option) };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        propertyTypeId: formData.propertyTypeId,
        status: formData.status,
        price: parseFloat(formData.price),
        priceType: formData.priceType,
        size: parseFloat(formData.size),
        sizeUnit: formData.sizeUnit,
        approximateLocation: formData.approximateLocation,
        gatedLocation: formData.gatedLocation,
        metadata,
        media,
      };

      const res = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to create property');
      }

      toast.success('Property created successfully!');
      router.push('/admin/properties');
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

      {/* 1. Basic Information */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <SectionHeader 
          title="Basic Information" 
          description="Provide the core details of the property, such as its title, description, and primary category. Make the title catchy and descriptive."
          icon={Info}
        />
        <div className="mv-card" style={{ flex: '2 1 500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--mv-bg-elevated)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <div>
            <label style={getLabelStyle()}>Property Title *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('title')}
              placeholder="e.g. Modern 3BHK Apartment in Koregaon Park"
            />
          </div>

          <div>
            <label style={getLabelStyle()}>Description *</label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              style={{ ...getInputStyle('description'), resize: 'vertical' }}
              placeholder="Highlight the key features, surrounding neighborhood, and overall appeal of the property..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={getLabelStyle()}>Category / Type *</label>
              <select
                name="propertyTypeId"
                required
                value={formData.propertyTypeId}
                onChange={handleChange}
                onFocus={() => setFocusedField('propertyTypeId')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('propertyTypeId')}
              >
                <option value="">Select a category...</option>
                {rootTypes.map(root => (
                  <optgroup key={root.id} label={root.name}>
                    <option value={root.id}>— {root.name} (General)</option>
                    {subTypes.filter(sub => sub.parentId === root.id).map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label style={getLabelStyle()}>Status *</label>
              <select
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                onFocus={() => setFocusedField('status')}
                onBlur={() => setFocusedField(null)}
                style={getInputStyle('status')}
              >
                <option value="DRAFT">Draft (Hidden)</option>
                <option value="PUBLISHED">Published (Visible)</option>
                <option value="SOLD">Sold / Rented</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pricing & Dimensions */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <SectionHeader 
          title="Pricing & Dimensions" 
          description="Set the asking price and specify the property dimensions. You can choose whether the price is fixed, negotiable, or available on request."
          icon={Tag}
        />
        <div className="mv-card" style={{ flex: '2 1 500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--mv-bg-elevated)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={getLabelStyle()}>Price (₹) *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('price')}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...getInputStyle('price'), flex: 2 }}
                  placeholder="e.g. 5000000"
                />
                <select
                  name="priceType"
                  value={formData.priceType}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('priceType')}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...getInputStyle('priceType'), flex: 1, padding: '0.875rem 0.5rem' }}
                >
                  <option value="FIXED">Fixed</option>
                  <option value="NEGOTIABLE">Negotiable</option>
                  <option value="ON_REQUEST">On Request</option>
                </select>
              </div>
            </div>

            <div>
              <label style={getLabelStyle()}>Size / Area *</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  name="size"
                  required
                  min="0"
                  step="0.01"
                  value={formData.size}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('size')}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...getInputStyle('size'), flex: 2 }}
                  placeholder="e.g. 1200"
                />
                <select
                  name="sizeUnit"
                  value={formData.sizeUnit}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('sizeUnit')}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...getInputStyle('sizeUnit'), flex: 1, padding: '0.875rem 0.5rem' }}
                >
                  <option value="SQFT">Sq.Ft</option>
                  <option value="SQM">Sq.M</option>
                  <option value="ACRE">Acre</option>
                  <option value="HECTARE">Hectare</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Location */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <SectionHeader 
          title="Location Details" 
          description="Provide a public-facing general location and an optional precise location visible only to registered users or admin."
          icon={MapPin}
        />
        <div className="mv-card" style={{ flex: '2 1 500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--mv-bg-elevated)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          <div>
            <label style={getLabelStyle()}>Approximate Location (Public) *</label>
            <input
              type="text"
              name="approximateLocation"
              required
              value={formData.approximateLocation}
              onChange={handleChange}
              onFocus={() => setFocusedField('approximateLocation')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('approximateLocation')}
              placeholder="e.g. Wagholi, Pune"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--mv-text-muted)', marginTop: '0.5rem' }}>This will be visible to everyone browsing the website.</p>
          </div>

          <div>
            <label style={{ ...getLabelStyle(), display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Gated Location
              <span style={{ fontSize: '0.7rem', background: 'rgba(245, 197, 24, 0.1)', color: 'var(--mv-accent)', padding: '2px 6px', borderRadius: '4px' }}>Registered Users Only</span>
            </label>
            <input
              type="text"
              name="gatedLocation"
              value={formData.gatedLocation}
              onChange={handleChange}
              onFocus={() => setFocusedField('gatedLocation')}
              onBlur={() => setFocusedField(null)}
              style={getInputStyle('gatedLocation')}
              placeholder="e.g. Flat 101, Majhi Tower, Phase 2"
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--mv-text-muted)', marginTop: '0.5rem' }}>Exact door number or sensitive location details.</p>
          </div>
        </div>
      </div>

      {/* 4. Dynamic Custom Fields */}
      {customFields.length > 0 && (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <SectionHeader 
            title="Amenities & Features" 
            description="Fill out specific details configured for your property types, such as facing, age, or furnishing status."
            icon={List}
          />
          <div className="mv-card" style={{ flex: '2 1 500px', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--mv-bg-elevated)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            {customFields.map((field) => (
              <div key={field.id} style={{ gridColumn: field.dataType === 'TEXT' || field.dataType === 'MULTI_SELECT' ? '1 / -1' : 'auto' }}>
                <label style={{ ...getLabelStyle(), display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {field.label}
                  {field.isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                  {field.isGated && <span style={{ fontSize: '0.7rem', background: 'rgba(245, 197, 24, 0.1)', color: 'var(--mv-accent)', padding: '2px 6px', borderRadius: '4px' }}>Protected</span>}
                </label>

                {field.dataType === 'TEXT' && (
                  <input
                    type="text"
                    required={field.isRequired}
                    value={metadata[field.key] || ''}
                    onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyle(field.key)}
                  />
                )}

                {field.dataType === 'NUMBER' && (
                  <input
                    type="number"
                    required={field.isRequired}
                    value={metadata[field.key] || ''}
                    onChange={(e) => handleMetadataChange(field.key, parseFloat(e.target.value))}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyle(field.key)}
                  />
                )}

                {field.dataType === 'DATE' && (
                  <input
                    type="date"
                    required={field.isRequired}
                    value={metadata[field.key] || ''}
                    onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyle(field.key)}
                  />
                )}

                {field.dataType === 'BOOLEAN' && (
                  <div style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--mv-text)' }}>
                      <input
                        type="radio"
                        name={field.key}
                        required={field.isRequired}
                        checked={metadata[field.key] === true}
                        onChange={() => handleMetadataChange(field.key, true)}
                        style={{ accentColor: 'var(--mv-accent)' }}
                      /> Yes
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--mv-text)' }}>
                      <input
                        type="radio"
                        name={field.key}
                        required={field.isRequired}
                        checked={metadata[field.key] === false}
                        onChange={() => handleMetadataChange(field.key, false)}
                        style={{ accentColor: 'var(--mv-accent)' }}
                      /> No
                    </label>
                  </div>
                )}

                {field.dataType === 'SELECT' && (
                  <select
                    required={field.isRequired}
                    value={metadata[field.key] || ''}
                    onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                    onFocus={() => setFocusedField(field.key)}
                    onBlur={() => setFocusedField(null)}
                    style={getInputStyle(field.key)}
                  >
                    <option value="">Select...</option>
                    {(field.options as string[])?.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {field.dataType === 'MULTI_SELECT' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)' }}>
                    {(field.options as string[])?.map((opt: string) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--mv-text)' }}>
                        <input
                          type="checkbox"
                          checked={(metadata[field.key] || []).includes(opt)}
                          onChange={(e) => handleMultiSelectChange(field.key, opt, e.target.checked)}
                          style={{ marginTop: '2px', accentColor: 'var(--mv-accent)' }}
                        />
                        <span style={{ lineHeight: 1.2 }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.description && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--mv-text-muted)', marginTop: '0.5rem' }}>
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Media Upload */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <SectionHeader 
          title="Photos & Videos" 
          description="Upload high-quality media to attract more leads. First image will be used as the thumbnail."
          icon={ImageIcon}
        />
        <div className="mv-card" style={{ flex: '2 1 500px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--mv-bg-elevated)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
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
          {loading ? 'Creating Property...' : 'Save & Publish'}
        </button>
      </div>

    </form>
  );
}
