'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useLoader } from '@/components/providers/LoaderProvider';
import ImageCropper from './ImageCropper';

export interface UploadedMedia {
  publicId: string;
  publicUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mimeType: string;
}

interface MediaUploaderProps {
  initialMedia?: UploadedMedia[];
  onMediaUploaded: (media: UploadedMedia[]) => void;
}

interface UploadSession {
  videos: File[];
  imagesToCrop: { file: File; url: string }[];
  croppedImages: File[];
}

export default function MediaUploader({ initialMedia = [], onMediaUploaded }: MediaUploaderProps) {
  const [uploads, setUploads] = useState<UploadedMedia[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [pendingUploadSession, setPendingUploadSession] = useState<UploadSession | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (uploading) {
      showLoader(`Uploading Media... ${progress}%`);
    } else {
      hideLoader();
    }
  }, [progress, uploading, showLoader, hideLoader]);

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError('');

    const newUploads = [...uploads];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const data: any = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/admin/media/upload');
          
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const filePercent = (event.loaded / event.total) * 100;
              const overallPercent = ((i * 100) + filePercent) / files.length;
              setProgress(Math.round(overallPercent));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (err) {
                reject(new Error('Invalid server response'));
              }
            } else {
              reject(new Error('Failed to upload file ' + file.name));
            }
          };

          xhr.onerror = () => reject(new Error('Network error while uploading'));
          
          const formData = new FormData();
          formData.append('file', file);
          xhr.send(formData);
        });
        
        newUploads.push({
          publicId: data.public_id,
          publicUrl: data.secure_url,
          mediaType: data.resource_type === 'video' ? 'VIDEO' : 'IMAGE',
          mimeType: data.format || file.type,
        });
      }

      setUploads(newUploads);
      onMediaUploaded(newUploads);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const videos = files.filter(f => f.type.startsWith('video/'));
    const images = files.filter(f => f.type.startsWith('image/'));

    if (images.length === 0) {
      uploadFiles(videos);
    } else {
      setPendingUploadSession({
        videos,
        imagesToCrop: images.map(f => ({ file: f, url: URL.createObjectURL(f) })),
        croppedImages: []
      });
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    if (!pendingUploadSession) return;

    const newImagesToCrop = [...pendingUploadSession.imagesToCrop];
    const finishedItem = newImagesToCrop.shift(); // remove first
    if (finishedItem) {
        URL.revokeObjectURL(finishedItem.url); // cleanup
    }
    
    const newSession = {
      ...pendingUploadSession,
      imagesToCrop: newImagesToCrop,
      croppedImages: [...pendingUploadSession.croppedImages, croppedFile]
    };

    if (newImagesToCrop.length === 0) {
      setPendingUploadSession(null);
      uploadFiles([...newSession.videos, ...newSession.croppedImages]);
    } else {
      setPendingUploadSession(newSession);
    }
  };

  const handleCropCancel = () => {
    if (!pendingUploadSession) return;

    const newImagesToCrop = [...pendingUploadSession.imagesToCrop];
    const finishedItem = newImagesToCrop.shift(); // remove first
    if (finishedItem) {
        URL.revokeObjectURL(finishedItem.url); // cleanup
    }
    
    const newSession = {
      ...pendingUploadSession,
      imagesToCrop: newImagesToCrop
    };

    if (newImagesToCrop.length === 0) {
      setPendingUploadSession(null);
      const toUpload = [...newSession.videos, ...newSession.croppedImages];
      if (toUpload.length > 0) {
        uploadFiles(toUpload);
      } else if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setPendingUploadSession(newSession);
    }
  };

  const handleRemove = (publicId: string) => {
    const updated = uploads.filter(u => u.publicId !== publicId);
    setUploads(updated);
    onMediaUploaded(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {pendingUploadSession && pendingUploadSession.imagesToCrop.length > 0 && (
        <ImageCropper
          imageSrc={pendingUploadSession.imagesToCrop[0].url}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Upload Dropzone */}
      <div 
        onClick={() => !uploading && !pendingUploadSession && fileInputRef.current?.click()}
        style={{
          border: '2px dashed #cbd5e1',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          cursor: uploading || pendingUploadSession ? 'not-allowed' : 'pointer',
          background: '#f8fafc',
          opacity: uploading || pendingUploadSession ? 0.6 : 1,
          transition: 'all 0.2s',
        }}
      >
        <Upload size={32} color="#64748b" style={{ margin: '0 auto 1rem' }} />
        <p style={{ margin: 0, fontWeight: 500, color: '#334155' }}>
          {uploading ? `Uploading... ${progress}%` : 
           pendingUploadSession ? 'Cropping in progress...' : 
           'Click to select images/videos'}
        </p>
        
        {uploading && (
          <div style={{ marginTop: '1rem', height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#f5c518', transition: 'width 0.2s ease' }} />
          </div>
        )}

        {!uploading && !pendingUploadSession && (
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>
            PNG, JPG, WEBP, MP4 (max 10MB)
          </p>
        )}
        <input 
          type="file" 
          multiple 
          accept="image/*,video/*"
          ref={fileInputRef} 
          onChange={handleFileChange}
          style={{ display: 'none' }} 
          disabled={uploading || pendingUploadSession !== null}
        />
      </div>

      {/* Upload Gallery Preview */}
      {uploads.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
          {uploads.map((media, index) => (
            <div 
              key={media.publicId} 
              style={{ 
                position: 'relative', 
                aspectRatio: '1',
                borderRadius: '8px', 
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                background: '#f1f5f9'
              }}
            >
              {media.mediaType === 'IMAGE' ? (
                <img 
                  src={media.publicUrl} 
                  alt={`Upload ${index + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <ImageIcon size={24} color="#64748b" />
                  <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>Video</span>
                </div>
              )}
              
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(media.publicId); }}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
