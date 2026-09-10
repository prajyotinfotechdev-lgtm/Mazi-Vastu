'use client';

import { useState, useEffect } from 'react';
import { useLoader } from '@/components/providers/LoaderProvider';
import MediaUploader, { UploadedMedia } from './MediaUploader';

export default function SiteSettingsForm() {
  const { showLoader, hideLoader } = useLoader();
  const [formData, setFormData] = useState({
    founderName: '',
    founderImage: '',
    officeAddress: '',
    phone: '',
    email: '',
    disclosure: '',
    instagramUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    whatsappUrl: '',
    linkedinUrl: '',
    telegramUrl: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      showLoader();
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setFormData({
            founderName: data.settings.founderName || '',
            founderImage: data.settings.founderImage || '',
            officeAddress: data.settings.officeAddress || '',
            phone: data.settings.phone || '',
            email: data.settings.email || '',
            disclosure: data.settings.disclosure || '',
            instagramUrl: data.settings.instagramUrl || '',
            facebookUrl: data.settings.facebookUrl || '',
            youtubeUrl: data.settings.youtubeUrl || '',
            whatsappUrl: data.settings.whatsappUrl || '',
            linkedinUrl: data.settings.linkedinUrl || '',
            telegramUrl: data.settings.telegramUrl || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      hideLoader();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMediaUpload = (media: UploadedMedia[]) => {
    if (media.length > 0) {
      // Use the last uploaded image
      setFormData((prev) => ({ ...prev, founderImage: media[media.length - 1].publicUrl }));
    } else {
      setFormData((prev) => ({ ...prev, founderImage: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showLoader();
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('An error occurred while saving.');
    } finally {
      hideLoader();
    }
  };

  const initialMedia = formData.founderImage
    ? [{ publicId: formData.founderImage, publicUrl: formData.founderImage, mediaType: 'IMAGE' as const, mimeType: 'image/jpeg' }]
    : [];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <label className="mv-label">Founder Image</label>
        <p style={{ fontSize: '0.875rem', color: 'var(--mv-text-muted)', marginBottom: '0.5rem' }}>Upload a photo of the founder. Square aspect ratio recommended.</p>
        <MediaUploader 
          initialMedia={initialMedia} 
          onMediaUploaded={handleMediaUpload} 
        />
      </div>

      <div>
        <label className="mv-label">Founder Name</label>
        <input
          type="text"
          name="founderName"
          value={formData.founderName}
          onChange={handleChange}
          className="mv-input"
          placeholder="e.g. Kishor Lavte"
          required
        />
      </div>

      <div>
        <label className="mv-label">Office Address</label>
        <textarea
          name="officeAddress"
          value={formData.officeAddress}
          onChange={handleChange}
          className="mv-input"
          rows={3}
          placeholder="e.g. 123 Real Estate Avenue..."
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label className="mv-label">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mv-input"
            placeholder="e.g. +91 98765 43210"
          />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label className="mv-label">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mv-input"
            placeholder="e.g. contact@mazivastu.com"
          />
        </div>
      </div>

      <div>
        <label className="mv-label">Disclosure Text</label>
        <textarea
          name="disclosure"
          value={formData.disclosure}
          onChange={handleChange}
          className="mv-input"
          rows={4}
          placeholder="Enter legal or informational disclosure..."
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Follow Us Links</h3>
        <div>
          <label className="mv-label">Instagram URL</label>
          <input
            type="url"
            name="instagramUrl"
            value={formData.instagramUrl}
            onChange={handleChange}
            className="mv-input"
            placeholder="https://instagram.com/..."
          />
        </div>
        <div>
          <label className="mv-label">Facebook URL</label>
          <input
            type="url"
            name="facebookUrl"
            value={formData.facebookUrl}
            onChange={handleChange}
            className="mv-input"
            placeholder="https://facebook.com/..."
          />
        </div>
        <div>
          <label className="mv-label">YouTube URL</label>
          <input
            type="url"
            name="youtubeUrl"
            value={formData.youtubeUrl}
            onChange={handleChange}
            className="mv-input"
            placeholder="https://youtube.com/..."
          />
        </div>
        <div>
          <label className="mv-label">WhatsApp URL / Number Link</label>
          <input
            type="url"
            name="whatsappUrl"
            value={formData.whatsappUrl}
            onChange={handleChange}
            className="mv-input"
            placeholder="https://wa.me/..."
          />
        </div>
        <div>
          <label className="mv-label">LinkedIn URL</label>
          <input
            type="url"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleChange}
            className="mv-input"
            placeholder="https://linkedin.com/..."
          />
        </div>
        <div>
          <label className="mv-label">Telegram URL</label>
          <input
            type="url"
            name="telegramUrl"
            value={formData.telegramUrl}
            onChange={handleChange}
            className="mv-input"
            placeholder="https://t.me/..."
          />
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button type="submit" className="mv-btn mv-btn-primary">
          Save Settings
        </button>
      </div>
    </form>
  );
}
