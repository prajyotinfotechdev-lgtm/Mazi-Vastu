'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface AdBannerProps {
  ad: {
    title: string;
    description: string | null;
    slug: string;
    media: { publicUrl: string; mediaType: string }[];
  };
  layout?: 'horizontal' | 'vertical' | 'premium';
}

export default function AdBanner({ ad, layout = 'horizontal' }: AdBannerProps) {
  if (layout === 'premium') {
    const coverImage = ad.media?.find(m => m.mediaType === 'IMAGE')?.publicUrl;

    return (
      <Link href={`/advertisements/${ad.slug}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
        <div className="mv-ad-premium-container" style={{
          background: '#0c0c0c',
          border: '1px solid rgba(245, 197, 24, 0.2)',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          transition: 'transform 300ms ease, box-shadow 300ms ease',
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)',
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.9), 0 0 0 1px var(--mv-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.8)';
            e.currentTarget.style.border = '1px solid rgba(245, 197, 24, 0.2)';
          }}
        >
          <style>{`
            .mv-ad-premium-content {
              padding: 20px;
              display: flex;
              flex-direction: column;
              z-index: 10;
              position: relative;
            }
            .mv-ad-premium-image-wrapper {
              position: relative;
              height: 160px;
              width: 100%;
              overflow: hidden;
            }
            .mv-ad-gradient-mobile {
              position: absolute;
              inset: 0;
              background: linear-gradient(to bottom, #0c0c0c 10%, transparent 60%);
              z-index: 2;
            }
            .mv-ad-gradient-desktop {
              display: none;
            }
            @media (min-width: 768px) {
              .mv-ad-premium-container {
                flex-direction: row !important;
                align-items: center;
                height: 130px; /* Long, short strip */
              }
              .mv-ad-premium-content {
                width: 60%;
                padding: 16px 32px;
                justify-content: center;
                z-index: 10;
              }
              .mv-ad-premium-image-wrapper {
                position: absolute;
                right: 0;
                top: 0;
                width: 60%;
                height: 100%;
                z-index: 1;
              }
              .mv-ad-gradient-mobile {
                display: none;
              }
              .mv-ad-gradient-desktop {
                display: block;
                position: absolute;
                inset: 0;
                background: linear-gradient(to right, #0c0c0c 0%, rgba(12,12,12,0.8) 40%, transparent 100%);
                z-index: 2;
              }
            }
          `}</style>

          <div className="mv-ad-premium-content">
            <h2 className="line-clamp-1" style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>
              {ad.title}
            </h2>
            {ad.description && (
              <p className="line-clamp-1" style={{ color: 'var(--mv-text-secondary)', fontSize: '0.875rem', lineHeight: 1.4, marginBottom: '12px', maxWidth: '500px' }}>
                {ad.description}
              </p>
            )}
            <div style={{ alignSelf: 'flex-start' }}>
              <div style={{
                background: 'var(--mv-accent, #f5c518)',
                color: '#000000',
                padding: '8px 20px',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '0.8125rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 200ms ease'
              }}>
                Learn More <ArrowRight size={14} />
              </div>
            </div>
          </div>

          <div className="mv-ad-premium-image-wrapper">
            {coverImage ? (
              <img
                src={coverImage}
                alt={ad.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                <span style={{ color: '#555' }}>Promotional</span>
              </div>
            )}
            <div className="mv-ad-gradient-mobile"></div>
            <div className="mv-ad-gradient-desktop"></div>
          </div>
        </div>
      </Link>
    );
  }

  if (layout === 'vertical') {
    return (
      <Link href={`/advertisements/${ad.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div style={{
          background: 'var(--mv-bg-surface)',
          border: '1px solid var(--mv-border)',
          borderRadius: 'var(--mv-radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'border-color 200ms ease',
        }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mv-border-light)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--mv-border)'}
        >
          <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="mv-badge mv-badge-accent" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>
              Sponsored
            </div>
            <h3 style={{ color: 'var(--mv-text)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {ad.title}
            </h3>
            <p className="line-clamp-2" style={{ color: 'var(--mv-text-muted)', fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              {ad.description}
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--mv-accent)', fontWeight: 600, fontSize: '0.8125rem' }}>
              Learn More <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Horizontal Layout
  return (
    <Link href={`/advertisements/${ad.slug}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
      <div style={{
        background: 'var(--mv-bg-surface)',
        border: '1px solid var(--mv-border)',
        borderRadius: 'var(--mv-radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1.25rem',
        transition: 'border-color 200ms ease',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--mv-border-accent)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--mv-border)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
          <div className="mv-badge mv-badge-accent" style={{ flexShrink: 0 }}>
            Sponsored
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
            <h3 className="line-clamp-1" style={{ color: 'var(--mv-text)', fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
              {ad.title}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--mv-accent)', fontWeight: 600, fontSize: '0.8125rem', flexShrink: 0 }}>
          Learn More <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}
