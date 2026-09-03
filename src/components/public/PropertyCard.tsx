'use client';

import Link from 'next/link';
import { MapPin, Maximize, ArrowUpRight, Home } from 'lucide-react';

interface PropertyCardProps {
  property: {
    slug: string;
    title: string;
    price: number;
    priceType: string;
    approximateLocation: string | null;
    size: number | null;
    sizeUnit: string | null;
    media: { publicUrl: string; mediaType: string }[];
    propertyType: { name: string };
  };
  isLocked?: boolean;
  lang?: string;
  variant?: 'default' | 'premium' | 'horizontal';
}

const translations: Record<string, Record<string, string>> = {
  en: { locationOnRequest: 'Location on request', onRequest: 'On Request' },
  mr: { locationOnRequest: 'स्थान विनंतीवर', onRequest: 'विनंतीवर' },
};

export default function PropertyCard({ property, isLocked = false, lang = 'en', variant = 'default' }: PropertyCardProps) {
  const tr = translations[lang] || translations.en;
  const coverImage = property.media?.find(m => m.mediaType === 'IMAGE')?.publicUrl;

  const priceText = isLocked ? (
    <div style={{
      width: '100px',
      height: '1.2em',
      borderRadius: '4px',
      background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 75%)',
      backgroundSize: '200% 100%',
      animation: 'mvShimmer 2s infinite linear'
    }} />
  ) : property.priceType === 'ON_REQUEST' ? (
    tr.onRequest
  ) : (
    `₹${property.price.toLocaleString('en-IN')}`
  );

  if (variant === 'premium') {
    return (
      <Link href={`/properties/${property.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          cursor: 'pointer',
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#050505',
        }}>
          {coverImage ? (
            <img
              src={coverImage}
              alt={property.title}
              loading="lazy"
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 400ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            <img
              src="/images/no-property-image.png"
              alt="No Property Image Available"
              loading="lazy"
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                background: '#0a0a0a'
              }}
            />
          )}

          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)',
            padding: '40px 16px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            pointerEvents: 'none'
          }}>
            <h3 className="line-clamp-1" style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              fontFamily: 'Outfit, sans-serif',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              {property.title}
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#f0f0f0',
              fontSize: '0.9375rem',
              marginBottom: '2px',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)'
            }}>
              <MapPin size={16} color="var(--mv-accent, #f5c518)" fill="var(--mv-accent, #f5c518)" />
              <span className="line-clamp-1">
                {property.approximateLocation || tr.locationOnRequest}
              </span>
            </div>

            <div style={{
              color: 'var(--mv-accent, #f5c518)',
              fontSize: '1.375rem',
              fontWeight: 700,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              fontFamily: 'Outfit, sans-serif',
            }}>
              {priceText}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/properties/${property.slug}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
        <div className="mv-card" style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          cursor: 'pointer',
          background: 'var(--mv-bg-surface)',
          border: '1px solid var(--mv-border)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <style>{`
            .mv-prop-horizontal {
              display: flex;
              flex-direction: row;
              height: 140px;
            }
            .mv-prop-horizontal-img {
              width: 120px;
              height: 100%;
              flex-shrink: 0;
              position: relative;
            }
            .mv-prop-horizontal-content {
              padding: 0.75rem 1rem;
              display: flex;
              flex-direction: column;
              justify-content: center;
              flex: 1;
              position: relative;
              min-width: 0; /* allows text truncation */
            }
            
            /* Responsive typography and spacing for mobile */
            .mv-prop-title {
              font-size: 1rem;
              margin-bottom: 0.25rem;
              padding-right: 1.5rem; /* space for heart */
            }
            .mv-prop-loc {
              font-size: 0.75rem;
              margin-bottom: 0.5rem;
            }
            .mv-prop-price {
              font-size: 1.125rem;
              margin-bottom: 0.5rem;
            }
            .mv-prop-specs {
              gap: 0.75rem;
            }
            .mv-prop-spec-item {
              font-size: 0.75rem;
            }
            .mv-prop-heart {
              top: 0.75rem;
              right: 1rem;
            }
            .mv-prop-badge {
              font-size: 0.55rem;
              padding: 0.15rem 0.4rem;
              top: 0.5rem;
              left: 0.5rem;
            }

            @media (min-width: 768px) {
              .mv-prop-horizontal {
                height: 200px;
              }
              .mv-prop-horizontal-img {
                width: 32%;
              }
              .mv-prop-horizontal-content {
                padding: 1.5rem 2rem;
              }
              .mv-prop-title {
                font-size: 1.25rem;
                margin-bottom: 0.5rem;
                padding-right: 2rem;
              }
              .mv-prop-loc {
                font-size: 0.875rem;
                margin-bottom: 1rem;
              }
              .mv-prop-price {
                font-size: 1.5rem;
                margin-bottom: 1rem;
              }
              .mv-prop-specs {
                gap: 1.25rem;
              }
              .mv-prop-spec-item {
                font-size: 0.875rem;
              }
              .mv-prop-heart {
                top: 1.5rem;
                right: 2rem;
              }
              .mv-prop-badge {
                font-size: 0.6875rem;
                padding: 0.25rem 0.75rem;
                top: 0.75rem;
                left: 0.75rem;
              }
            }
          `}</style>

          <div className="mv-prop-horizontal">
            {/* Image Container */}
            <div className="mv-prop-horizontal-img">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt={property.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src="/images/no-property-image.png"
                  alt="No Property Image Available"
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#0a0a0a' }}
                />
              )}
              {/* Property Type Badge */}
              <div className="mv-prop-badge" style={{
                position: 'absolute',
                background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
                borderRadius: 'var(--mv-radius-full)',
                fontWeight: 700, color: 'var(--mv-accent)',
                textTransform: 'uppercase', border: '1px solid rgba(245, 197, 24, 0.15)'
              }}>
                {property.propertyType.name}
              </div>
            </div>

            {/* Content Container */}
            <div className="mv-prop-horizontal-content">
              {/* Favorite Icon */}
              <div className="mv-prop-heart" style={{ position: 'absolute', color: 'var(--mv-text-muted)' }}>
                ♡
              </div>

              {/* Title */}
              <h3 className="line-clamp-1 mv-prop-title" style={{ fontWeight: 700, color: 'var(--mv-text)', fontFamily: 'Outfit, sans-serif' }}>
                {property.title}
              </h3>

              {/* Location */}
              <div className="mv-prop-loc" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--mv-text-muted)' }}>
                <MapPin size={14} color="var(--mv-accent, #f5c518)" fill="var(--mv-accent, #f5c518)" style={{ flexShrink: 0 }} />
                <span className="line-clamp-1">{property.approximateLocation || tr.locationOnRequest}</span>
              </div>

              {/* Price */}
              <div className="mv-prop-price" style={{ color: 'var(--mv-accent, #f5c518)', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
                {priceText}
              </div>

              {/* Specs */}
              <div className="mv-prop-specs" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                {(property.size || isLocked) && (
                  <div className="mv-prop-spec-item" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--mv-text-secondary)' }}>
                    <Maximize size={14} color="var(--mv-text-muted)" />
                  {isLocked ? (
                    <div style={{
                      width: '60px',
                      height: '1em',
                      borderRadius: '4px',
                      display: 'inline-block',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'mvShimmer 2s infinite linear'
                    }} />
                  ) : property.size} {property.sizeUnit || 'sq.ft'}
                  </div>
                )}
                <div className="mv-prop-spec-item" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--mv-text-secondary)' }}>
                  <Home size={14} color="var(--mv-text-muted)" />
                  {property.propertyType.name}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/properties/${property.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div className="mv-card" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
      }}>

        {/* Image Container */}
        <div style={{
          position: 'relative',
          height: '200px',
          overflow: 'hidden',
          background: 'var(--mv-bg-surface)',
        }}>
          {coverImage ? (
            <img
              src={coverImage}
              alt={property.title}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 400ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            <img
              src="/images/no-property-image.png"
              alt="No Property Image Available"
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                background: '#0a0a0a'
              }}
            />
          )}

          {/* Property Type Badge */}
          <div style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--mv-radius-full)',
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--mv-accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            border: '1px solid rgba(245, 197, 24, 0.15)',
          }}>
            {property.propertyType.name}
          </div>

          {/* Arrow icon */}
          <div style={{
            position: 'absolute',
            bottom: '0.75rem',
            right: '0.75rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            transition: 'all 200ms ease',
          }}>
            <ArrowUpRight size={14} />
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: '1rem 1.25rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}>
          {/* Title */}
          <h3 className="line-clamp-1" style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--mv-text)',
            marginBottom: '0.375rem',
            fontFamily: 'Outfit, sans-serif',
          }}>
            {property.title}
          </h3>

          {/* Location */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: 'var(--mv-text-muted)',
            fontSize: '0.8125rem',
            marginBottom: '1rem',
          }}>
            <MapPin size={13} />
            <span className="line-clamp-1">
              {property.approximateLocation || tr.locationOnRequest}
            </span>
          </div>

          {/* Specs row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
          }}>
            {(property.size || isLocked) && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                color: 'var(--mv-text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}>
                <Maximize size={14} color="var(--mv-text-muted)" />
                {isLocked ? (
                  <div style={{
                    width: '60px',
                    height: '1em',
                    borderRadius: '4px',
                    display: 'inline-block',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'mvShimmer 2s infinite linear'
                  }} />
                ) : `${property.size} ${property.sizeUnit || 'sq.ft'}`}
              </div>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: 'var(--mv-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}>
              <Home size={14} color="var(--mv-text-muted)" />
              {property.propertyType.name}
            </div>
          </div>

          {/* Price bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '0.875rem',
            borderTop: '1px solid var(--mv-border)',
          }}>
            <div className="mv-price" style={{ fontSize: '1.125rem' }}>
              {priceText}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
