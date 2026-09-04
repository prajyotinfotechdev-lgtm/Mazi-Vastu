import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { MapPin, Maximize, Home, ShieldCheck, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import LeadForm from '@/components/public/LeadForm';
import UnlockButton from '@/components/public/UnlockButton';
import MediaGallery from '@/components/public/MediaGallery';
import { cookies } from 'next/headers';
import { getLanguage } from '@/lib/i18n/get-language';
import { t } from '@/lib/i18n/translate';
import { cache } from 'react';

// ISR disabled since cookies() are used in the RootLayout
// export const revalidate = 300;

// Deduplicated DB fetch - called once per request even if invoked from
// both generateMetadata and the page component (React request-level cache)
const getProperty = cache(async (slug: string) => {
  return prisma.property.findUnique({
    where: { slug },
    include: {
      propertyType: true,
      media: { orderBy: { sortOrder: 'asc' } }
    }
  });
});

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const property = await getProperty(params.slug);
  if (!property) return { title: 'Not Found' };
  return {
    title: `${property.title} | MaziVastu`,
    description: property.description,
    openGraph: {
      title: `${property.title} | MaziVastu`,
      description: property.description ?? undefined,
      images: property.seoTitle ? [] : [],
    }
  };
}

export default async function PropertyDetailPage({ params }: { params: { slug: string } }) {
  const lang = getLanguage();

  // Reuses the cached result from generateMetadata - zero extra DB roundtrip
  const property = await getProperty(params.slug);

  if (!property || property.status !== 'PUBLISHED' || property.deletedAt) {
    notFound();
  }

  const cookieStore = cookies();
  const visitorCookie = cookieStore.get('visitor_info');
  const visitorInfo = visitorCookie ? JSON.parse(visitorCookie.value) : null;
  const isLocked = !visitorInfo;

  return (
    <div style={{ background: 'var(--mv-bg)', minHeight: '100vh', padding: 'var(--mv-space-3xl) 0' }}>
      <div className="mv-container">
        
        {/* Breadcrumb / Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--mv-space-2xl)' }}>
          <Link href="/properties" className="mv-btn mv-btn-ghost" style={{ padding: '0.5rem 0', display: 'inline-flex' }}>
            <ArrowLeft size={18} /> {t('property.backToSearch', lang)}
          </Link>
        </div>

        <div className="mv-detail-grid">
          
          {/* LEFT: Media Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mv-space-md)' }}>
            <MediaGallery media={property.media} />
          </div>

          {/* RIGHT: Content & Specs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--mv-space-3xl)', flexWrap: 'wrap', gap: 'var(--mv-space-base)' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h1 className="mv-heading-lg" style={{ color: 'var(--mv-text)', margin: '0 0 0.5rem 0' }}>
                  {property.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.9375rem' }}>
                  <MapPin size={16} /> {isLocked ? t('property.locationHidden', lang) : (property.approximateLocation || t('property.locationOnRequest', lang))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="mv-price" style={{ fontSize: '1.75rem' }}>
                  {isLocked ? (
                    <div style={{
                      width: '160px',
                      height: '1.2em',
                      borderRadius: '8px',
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'mvShimmer 2s infinite linear'
                    }} />
                  ) : (
                    property.priceType === 'ON_REQUEST' ? t('property.onRequest', lang) : `₹${property.price.toLocaleString('en-IN')}`
                  )}
                </div>
              </div>
            </div>

            {/* Specifications Grid */}
            <div style={{ marginBottom: 'var(--mv-space-3xl)' }}>
              <h3 className="mv-heading-sm" style={{ color: 'var(--mv-text)', marginBottom: 'var(--mv-space-lg)' }}>{t('property.specifications', lang)}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--mv-space-base)' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Home size={20} color="var(--mv-text-muted)" strokeWidth={1.5} />
                  <div style={{ color: 'var(--mv-text)', fontSize: '0.9375rem', fontWeight: 500 }}>{property.propertyType.name}</div>
                </div>

                {(property.size || isLocked) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Maximize size={20} color="var(--mv-text-muted)" strokeWidth={1.5} />
                    {isLocked ? (
                      <div style={{
                        width: '80px',
                        height: '1em',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'mvShimmer 2s infinite linear'
                      }} />
                    ) : (
                      <div style={{ color: 'var(--mv-text)', fontSize: '0.9375rem', fontWeight: 500 }}>
                        {property.size} {property.sizeUnit}
                      </div>
                    )}
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShieldCheck size={20} color="var(--mv-accent)" strokeWidth={1.5} />
                  <div style={{ color: 'var(--mv-text)', fontSize: '0.9375rem', fontWeight: 500 }}>{t('property.verified', lang)}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 'var(--mv-space-3xl)', position: 'relative' }}>
              <h3 className="mv-heading-sm" style={{ color: 'var(--mv-text)', marginBottom: 'var(--mv-space-lg)' }}>{t('property.aboutThisProperty', lang)}</h3>
              
              <div style={{ position: 'relative' }}>
                <p className="mv-body" style={{ 
                  color: 'var(--mv-text-secondary)', 
                  whiteSpace: 'pre-wrap', 
                  margin: 0, 
                  maxHeight: isLocked ? '120px' : 'auto',
                  overflow: 'hidden'
                }}>
                  {property.description || t('property.noDescription', lang)}
                </p>
                {isLocked && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '120px',
                    background: 'linear-gradient(to bottom, transparent 0%, var(--mv-bg) 90%, var(--mv-bg) 100%)',
                    pointerEvents: 'none'
                  }}></div>
                )}
              </div>
            </div>

            {/* Lead Form (Check Availability Style) */}
            <div style={{ position: 'relative', marginTop: 'var(--mv-space-4xl)' }}>
              <div className="mv-card" style={{ 
                padding: 'var(--mv-space-xl)', 
                opacity: isLocked ? 0.15 : 1, 
                pointerEvents: isLocked ? 'none' : 'auto',
                transition: 'opacity 0.3s ease'
              }}>
                <h3 className="mv-heading-sm" style={{ color: 'var(--mv-text)', marginBottom: 'var(--mv-space-lg)' }}>
                  {t('property.interested', lang)}
                </h3>
                <LeadForm source="PROPERTY_INQUIRY" referenceId={property.id} visitorInfo={visitorInfo} lang={lang} />
              </div>
              
              {isLocked && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20,
                  gap: 'clamp(1rem, 3vw, 1.5rem)',
                  padding: 'clamp(1rem, 5vw, 2rem)',
                  textAlign: 'center',
                  background: 'radial-gradient(circle at center, rgba(10,10,10,0.9) 0%, rgba(10,10,10,0.6) 50%, transparent 100%)'
                }}>
                  <div>
                    <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                      Premium Content Locked
                    </div>
                    <div style={{ color: 'var(--mv-text-secondary)', fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
                      Enter your details once to instantly reveal the owner's exact asking price, precise location, and full description.
                    </div>
                  </div>
                  <UnlockButton propertyId={property.id} label="Unlock Full Details" />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
