'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

type Media = {
  id: string;
  mediaType: string;
  publicUrl: string;
  sortOrder: number;
};

export default function MediaGallery({ media }: { media: Media[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // When opening lightbox, scroll to the correct image immediately
  useEffect(() => {
    if (lightboxIndex !== null && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({ left: lightboxIndex * window.innerWidth, behavior: 'instant' });
    }
  }, [lightboxIndex]);

  const handleNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: window.innerWidth, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -window.innerWidth, behavior: 'smooth' });
    }
  };

  if (!media || media.length === 0) {
    return (
      <div style={{ borderRadius: 'var(--mv-radius-xl)', overflow: 'hidden', height: 'clamp(300px, 50vh, 500px)', width: '100%', position: 'relative', border: '1px solid var(--mv-border)' }}>
        <img src="/images/no-property-image.png" alt="No Image Available" style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#0a0a0a' }} />
      </div>
    );
  }

  return (
    <>
      {/* Static Grid View */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mv-space-md)' }}>
        {/* Main Large Image */}
        <div 
          onClick={() => setLightboxIndex(0)}
          style={{ borderRadius: 'var(--mv-radius-xl)', overflow: 'hidden', height: 'clamp(300px, 50vh, 500px)', width: '100%', position: 'relative', border: '1px solid var(--mv-border)', cursor: 'pointer' }}
        >
          {media[0].mediaType === 'IMAGE' ? (
            <img src={media[0].publicUrl} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="hover-scale" />
          ) : (
            <video src={media[0].publicUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} onClick={(e) => e.stopPropagation()} />
          )}
        </div>
        
        {/* Thumbnails row */}
        {media.length > 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--mv-space-md)', height: '140px' }}>
            {media.slice(1, 4).map((item, i) => (
              <div 
                key={item.id} 
                onClick={() => setLightboxIndex(i + 1)}
                style={{ borderRadius: 'var(--mv-radius-md)', overflow: 'hidden', position: 'relative', border: '1px solid var(--mv-border)', cursor: 'pointer' }}
              >
                {item.mediaType === 'IMAGE' ? (
                  <img src={item.publicUrl} alt={`Gallery ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="hover-scale" />
                ) : (
                  <video src={item.publicUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                
                {/* View All Overlay on 3rd thumbnail if more images exist */}
                {i === 2 && media.length > 4 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '1rem', transition: 'background 0.2s' }}>
                    <ImageIcon size={24} style={{ marginBottom: '0.25rem' }} />
                    View All +{media.length - 4}
                  </div>
                )}
              </div>
            ))}
            
            {/* Empty placeholders if less than 4 images total */}
            {Array.from({ length: Math.max(0, 4 - media.length) }).map((_, i) => (
              <div key={`empty-${i}`} style={{ borderRadius: 'var(--mv-radius-md)', background: 'var(--mv-bg-surface)' }}></div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'black',
          display: 'flex', flexDirection: 'column'
        }}>
          {/* Top Bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', zIndex: 10, background: 'linear-gradient(rgba(0,0,0,0.8), transparent)' }}>
            <div style={{ color: 'white', fontSize: '1.125rem', fontWeight: 500, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Gallery ({media.length} items)
            </div>
            <button 
              onClick={() => setLightboxIndex(null)}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(8px)' }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Swipeable Container */}
          <div 
            ref={scrollContainerRef}
            style={{ 
              display: 'flex', overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory', 
              flex: 1, scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' 
            }}
          >
            {media.map((item, index) => (
              <div 
                key={item.id} 
                style={{ 
                  flex: '0 0 100vw', height: '100%', scrollSnapAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' 
                }}
              >
                {item.mediaType === 'IMAGE' ? (
                  <img src={item.publicUrl} alt={`Full ${index}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                  <video src={item.publicUrl} controls style={{ maxWidth: '100%', maxHeight: '100%' }} />
                )}
              </div>
            ))}
          </div>

          {/* Desktop Navigation Arrows */}
          <button 
            onClick={handlePrev}
            className="hidden-mobile"
            style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '1rem', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(8px)', zIndex: 10 }}
          >
            <ChevronLeft size={32} />
          </button>
          
          <button 
            onClick={handleNext}
            className="hidden-mobile"
            style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '1rem', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(8px)', zIndex: 10 }}
          >
            <ChevronRight size={32} />
          </button>
          
          {/* Mobile Swipe Hint */}
          <div className="hidden-desktop" style={{ position: 'absolute', bottom: '2rem', left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', pointerEvents: 'none', zIndex: 10 }}>
            Swipe left/right to view more
          </div>
        </div>
      )}
    </>
  );
}
