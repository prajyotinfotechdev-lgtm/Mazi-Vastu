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

interface MediaQueueItem {
  file: File;
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

interface ProcessedMediaItem {
  file: File;
  cropData?: any;
}

interface UploadSession {
  mediaToCrop: MediaQueueItem[];
  processedMedia: ProcessedMediaItem[];
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
    }
  }, [progress, uploading, showLoader]);

  const uploadFiles = async (items: ProcessedMediaItem[]) => {
    if (items.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError('');
    showLoader('Uploading Media... 0%');

    const newUploads = [...uploads];

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        const data: any = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/admin/media/upload');
          
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const filePercent = (event.loaded / event.total) * 100;
              const overallPercent = ((i * 100) + filePercent) / items.length;
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
              reject(new Error('Failed to upload file ' + item.file.name));
            }
          };

          xhr.onerror = () => reject(new Error('Network error while uploading'));
          
          const formData = new FormData();
          formData.append('file', item.file);
          if (item.cropData) {
            formData.append('cropParams', JSON.stringify(item.cropData));
          }
          xhr.send(formData);
        });
        
        newUploads.push({
          publicId: data.public_id,
          publicUrl: data.secure_url,
          mediaType: data.resource_type === 'video' ? 'VIDEO' : 'IMAGE',
          mimeType: data.format || item.file.type,
        });
      }

      setUploads(newUploads);
      onMediaUploaded(newUploads);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      setProgress(0);
      hideLoader();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    const mediaToCrop: MediaQueueItem[] = files.map(f => ({
      file: f,
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
    }));

    setPendingUploadSession({
      mediaToCrop,
      processedMedia: []
    });
  };

  const handleCropComplete = (croppedFile: File, cropData?: any) => {
    if (!pendingUploadSession) return;

    const newMediaToCrop = [...pendingUploadSession.mediaToCrop];
    const finishedItem = newMediaToCrop.shift(); // remove first
    if (finishedItem) {
      URL.revokeObjectURL(finishedItem.url); // cleanup
    }
    
    const newSession = {
      ...pendingUploadSession,
      mediaToCrop: newMediaToCrop,
      processedMedia: [...pendingUploadSession.processedMedia, { file: croppedFile, cropData }]
    };

    if (newMediaToCrop.length === 0) {
      setPendingUploadSession(null);
      uploadFiles(newSession.processedMedia);
    } else {
      setPendingUploadSession(newSession);
    }
  };

  const handleCropCancel = () => {
    if (!pendingUploadSession) return;

    const newMediaToCrop = [...pendingUploadSession.mediaToCrop];
    const finishedItem = newMediaToCrop.shift(); // remove first
    if (finishedItem) {
      URL.revokeObjectURL(finishedItem.url); // cleanup
    }
    
    const newSession = {
      ...pendingUploadSession,
      mediaToCrop: newMediaToCrop
    };

    if (newMediaToCrop.length === 0) {
      setPendingUploadSession(null);
      if (newSession.processedMedia.length > 0) {
        uploadFiles(newSession.processedMedia);
      } else if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setPendingUploadSession(newSession);
    }
  };

  const handleSkipCrop = () => {
    if (!pendingUploadSession) return;

    const newMediaToCrop = [...pendingUploadSession.mediaToCrop];
    const finishedItem = newMediaToCrop.shift(); // remove first
    if (finishedItem) {
      URL.revokeObjectURL(finishedItem.url); // cleanup
    }

    const newSession = {
      ...pendingUploadSession,
      mediaToCrop: newMediaToCrop,
      processedMedia: finishedItem 
        ? [...pendingUploadSession.processedMedia, { file: finishedItem.file }] 
        : pendingUploadSession.processedMedia
    };

    if (newMediaToCrop.length === 0) {
      setPendingUploadSession(null);
      uploadFiles(newSession.processedMedia);
    } else {
      setPendingUploadSession(newSession);
    }
  };

  const handleRemove = (publicId: string) => {
    const updated = uploads.filter(u => u.publicId !== publicId);
    setUploads(updated);
    onMediaUploaded(updated);
  };

  const totalMediaCount = pendingUploadSession 
    ? pendingUploadSession.processedMedia.length + pendingUploadSession.mediaToCrop.length 
    : 0;
  const currentMediaIndex = pendingUploadSession 
    ? pendingUploadSession.processedMedia.length + 1 
    : 0;

  const currentMediaItem = pendingUploadSession && pendingUploadSession.mediaToCrop.length > 0
    ? pendingUploadSession.mediaToCrop[0]
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {currentMediaItem && (
        <ImageCropper
          mediaSrc={currentMediaItem.url}
          mediaType={currentMediaItem.type}
          originalFile={currentMediaItem.file}
          currentIndex={currentMediaIndex}
          totalCount={totalMediaCount}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          onSkip={handleSkipCrop}
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
                <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0f172a' }}>
                  <video 
                    src={media.publicUrl} 
                    muted 
                    loop 
                    playsInline 
                    autoPlay 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: '4px', 
                      left: '4px', 
                      background: 'rgba(168, 85, 247, 0.85)', 
                      color: '#fff', 
                      fontSize: '0.65rem', 
                      fontWeight: 700, 
                      padding: '1px 6px', 
                      borderRadius: '4px' 
                    }}
                  >
                    VIDEO
                  </div>
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
