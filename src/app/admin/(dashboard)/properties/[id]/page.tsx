import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Tag, Ruler, IndianRupee, Info, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default async function AdminPropertyDetailsPage({ params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      propertyType: true,
      media: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (!property) {
    notFound();
  }

  const metadata = property.metadata ? (property.metadata as Record<string, any>) : {};

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Properties
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="mv-heading-xl" style={{ margin: 0 }}>
            {property.title}
          </h1>
          <span className={`mv-badge ${property.status === 'PUBLISHED' ? 'mv-badge-accent' : ''}`} style={{ 
            background: property.status === 'DRAFT' ? 'var(--mv-bg-elevated)' : (property.status === 'PUBLISHED' ? undefined : 'rgba(239, 68, 68, 0.1)'), 
            color: property.status === 'DRAFT' ? 'var(--mv-text-secondary)' : (property.status === 'PUBLISHED' ? undefined : '#ef4444'), 
            padding: '0.5rem 1rem', 
            fontSize: '0.875rem'
          }}>
            {property.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Core Details & Media */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Main Info Card */}
          <div className="mv-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--mv-text)', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={20} style={{ color: 'var(--mv-accent)' }} /> Base Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <IndianRupee size={14} /> Price
                </div>
                <div style={{ color: 'var(--mv-text)', fontWeight: 600, fontSize: '1.5rem' }}>
                  {property.priceType === 'ON_REQUEST' ? 'Price on Request' : property.price ? `₹${property.price.toLocaleString('en-IN')}` : 'N/A'}
                  {property.priceType !== 'FIXED' && property.priceType !== 'ON_REQUEST' && (
                    <span style={{ fontSize: '1rem', color: 'var(--mv-text-secondary)', marginLeft: '0.5rem', fontWeight: 400 }}>({property.priceType.replace('_', ' ')})</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <Tag size={14} /> Category
                </div>
                <div style={{ color: 'var(--mv-text)', fontWeight: 500, fontSize: '1.125rem' }}>{property.propertyType.name}</div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <Ruler size={14} /> Size
                </div>
                <div style={{ color: 'var(--mv-text)', fontWeight: 500, fontSize: '1.125rem' }}>
                  {property.size ? `${property.size} ${property.sizeUnit}` : 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <MapPin size={14} /> Location
                </div>
                <div style={{ color: 'var(--mv-text)', fontWeight: 500, fontSize: '1.125rem' }}>{property.approximateLocation || 'Not specified'}</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <div style={{ color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Description
              </div>
              <p style={{ color: 'var(--mv-text)', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                {property.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Media Gallery Card */}
          <div className="mv-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--mv-text)', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={20} style={{ color: 'var(--mv-accent)' }} /> Media Gallery
            </h3>
            
            {property.media.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--mv-text-muted)', background: 'var(--mv-bg-elevated)', borderRadius: '8px', border: '1px dashed var(--mv-border)' }}>
                No media uploaded for this property.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {property.media.map((m) => (
                  <div key={m.id} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--mv-border)' }}>
                    {m.mediaType === 'IMAGE' ? (
                      <Image 
                        src={m.publicUrl} 
                        alt="Property media" 
                        fill 
                        style={{ objectFit: 'cover' }} 
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <video 
                        src={m.publicUrl} 
                        controls 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Fields & Internal Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Dynamic Metadata Card */}
          <div className="mv-card">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--mv-text)', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              Property Features
            </h3>
            
            {Object.keys(metadata).length === 0 ? (
              <div style={{ color: 'var(--mv-text-muted)', fontSize: '0.875rem' }}>No extra features defined.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--mv-border)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--mv-text-secondary)', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontWeight: 500, color: 'var(--mv-text)', fontSize: '0.875rem', textAlign: 'right' }}>
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Internal Details Card */}
          <div className="mv-card" style={{ background: 'var(--mv-bg-elevated)', border: '1px solid var(--mv-border)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--mv-text)', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
              Internal Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Gated Location (Private)</span>
                <span style={{ color: 'var(--mv-text)', fontSize: '0.875rem', fontWeight: 500 }}>{property.gatedLocation || 'Not specified'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>System Slug</span>
                <span style={{ color: 'var(--mv-text)', fontSize: '0.875rem', background: 'var(--mv-bg)', padding: '0.125rem 0.375rem', borderRadius: '4px', fontFamily: 'monospace' }}>{property.slug}</span>
              </div>
              <div>
                <span style={{ color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Created At</span>
                <span style={{ color: 'var(--mv-text)', fontSize: '0.875rem' }}>{property.createdAt.toLocaleString()}</span>
              </div>
              {property.publishedAt && (
                <div>
                  <span style={{ color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>Published At</span>
                  <span style={{ color: 'var(--mv-text)', fontSize: '0.875rem' }}>{property.publishedAt.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
