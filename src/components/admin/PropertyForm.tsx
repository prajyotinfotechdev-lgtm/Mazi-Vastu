'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, Info, Tag, MapPin, List, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLoader } from '@/components/providers/LoaderProvider';
import MediaUploader, { UploadedMedia } from './MediaUploader';
import AddCustomFieldModal from './AddCustomFieldModal';
import AddPropertyTypeModal from './AddPropertyTypeModal';

interface PropertyType {
  id: string;
  name: string;
  parentId: string | null;
}

interface PropertyFormProps {
  propertyTypes: PropertyType[];
  customFields: any[];
  initialData?: any;
  existingLocations?: string[];
}

export default function PropertyForm({ propertyTypes, customFields, initialData, existingLocations = [] }: PropertyFormProps) {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [dynamicFields, setDynamicFields] = useState(customFields);
  const [dynamicTypes, setDynamicTypes] = useState(propertyTypes);

  const isEdit = !!initialData;

  // Base Field State
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    propertyTypeId: initialData?.propertyTypeId || '',
    status: initialData?.status || 'DRAFT',
    price: initialData?.price?.toString() || '',
    priceType: initialData?.priceType || 'FIXED',
    size: initialData?.size?.toString() || '',
    sizeUnit: initialData?.sizeUnit || 'SQFT',
    approximateLocation: initialData?.approximateLocation || '',
    gatedLocation: initialData?.gatedLocation || '',
  });

  // Dynamic Metadata State
  const [metadata, setMetadata] = useState<Record<string, any>>(initialData?.metadata || {});
  
  // Media State
  const [media, setMedia] = useState<UploadedMedia[]>(initialData?.media || []);

  const filteredLocations = existingLocations.filter(loc => 
    formData.approximateLocation.length > 0 &&
    loc.toLowerCase().includes(formData.approximateLocation.toLowerCase()) &&
    loc.toLowerCase() !== formData.approximateLocation.toLowerCase()
  ).slice(0, 5);
  
  const showLocationSuggestions = focusedField === 'approximateLocation' && filteredLocations.length > 0;

  // Derived state
  const rootTypes = dynamicTypes.filter(pt => !pt.parentId);
  const subTypes = dynamicTypes.filter(pt => pt.parentId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'propertyTypeId' && value === 'ADD_NEW_TYPE') {
      setShowTypeModal(true);
      return;
    }

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
    showLoader(isEdit ? 'Updating Property...' : 'Creating Property...');
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

      const url = isEdit ? `/api/admin/properties/${initialData.id}` : '/api/admin/properties';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || `Failed to ${isEdit ? 'update' : 'create'} property`);
      }

      toast.success(`Property ${isEdit ? 'updated' : 'created'} successfully!`);
      router.push('/admin/properties');
      router.refresh();

    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  const handleDeleteField = async (fieldId: string, fieldLabel: string) => {
    if (!confirm(`Are you sure you want to delete the custom field "${fieldLabel}"? This will hide it from future properties.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/custom-fields/${fieldId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete field');
      
      setDynamicFields(prev => prev.filter(f => f.id !== fieldId));
      toast.success('Field deleted');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
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
    <div style={{ position: 'relative' }}>
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
                  <optgroup label="Actions">
                    <option value="ADD_NEW_TYPE">+ Add New Property Type...</option>
                  </optgroup>
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
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mv-text-muted)' }} />
                <input
                  type="text"
                  name="approximateLocation"
                  autoComplete="off"
                  value={formData.approximateLocation}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('approximateLocation')}
                  onBlur={() => setTimeout(() => { if(focusedField === 'approximateLocation') setFocusedField(null) }, 200)}
                  style={getInputStyle('approximateLocation')}
                  placeholder="e.g. Kothrud, Pune"
                />
                
                {/* Autocomplete Dropdown */}
                {showLocationSuggestions && (
                  <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--mv-bg-elevated)',
                    border: '1px solid var(--mv-border)',
                    borderRadius: '8px',
                    marginTop: '4px',
                    padding: '8px 0',
                    listStyle: 'none',
                    zIndex: 50,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                  }}>
                    {filteredLocations.map((loc, idx) => (
                      <li 
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setFormData({ ...formData, approximateLocation: loc });
                          setFocusedField(null);
                        }}
                        style={{
                          padding: '10px 16px',
                          cursor: 'pointer',
                          color: 'var(--mv-text)',
                          fontSize: '0.9rem',
                          background: 'transparent',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <MapPin size={14} style={{ display: 'inline', marginRight: '8px', color: 'var(--mv-text-muted)' }} />
                        {loc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <SectionHeader 
            title="Amenities & Features" 
            description="Fill out specific details configured for your property types, such as facing, age, or furnishing status."
            icon={List}
          />
          <div className="mv-card" style={{ flex: '2 1 500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--mv-bg-elevated)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--mv-text)', margin: 0 }}>
                Additional Details
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245, 197, 24, 0.1)', color: 'var(--mv-accent)', border: '1px solid rgba(245, 197, 24, 0.2)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(245, 197, 24, 0.2)')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(245, 197, 24, 0.1)')}
              >
                <Plus size={16} /> Add Custom Field
              </button>
            </div>

            {dynamicFields.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {dynamicFields.map((field) => (
                  <div key={field.id} style={{ gridColumn: field.dataType === 'TEXT' || field.dataType === 'MULTI_SELECT' ? '1 / -1' : 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--mv-text-secondary)', margin: 0 }}>
                        {field.label}
                        {field.isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                        {field.isGated && <span style={{ fontSize: '0.7rem', background: 'rgba(245, 197, 24, 0.1)', color: 'var(--mv-accent)', padding: '2px 6px', borderRadius: '4px' }}>Protected</span>}
                      </label>
                      <button 
                        type="button"
                        onClick={() => handleDeleteField(field.id, field.label)}
                        style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.8)', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                        onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(239, 68, 68, 0.8)')}
                        title={`Delete ${field.label} field`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

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
            ) : (
              <div style={{ color: 'var(--mv-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                No custom amenities defined yet. Click "Add Custom Field" to create one.
              </div>
            )}
          </div>
        </div>

        {/* 5. Media Upload */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <SectionHeader 
            title="Photos & Videos" 
            description="Upload high-quality media to attract more leads. First image will be used as the thumbnail."
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
            {loading ? 'Saving...' : (isEdit ? 'Save Changes' : 'Save & Publish')}
          </button>
        </div>

      </form>

      {showTypeModal && (
        <AddPropertyTypeModal
          rootTypes={rootTypes}
          onClose={() => setShowTypeModal(false)}
          onSuccess={(newType) => {
            setDynamicTypes(prev => [...prev, newType]);
            setFormData(prev => ({ ...prev, propertyTypeId: newType.id }));
          }}
        />
      )}

      {showModal && (
        <AddCustomFieldModal 
          onClose={() => setShowModal(false)}
          onSuccess={(newField) => setDynamicFields(prev => [...prev, newField])}
        />
      )}
    </div>
  );
}
