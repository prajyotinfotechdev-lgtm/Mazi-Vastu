import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { Calendar, User, Phone, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const ad = await prisma.advertisement.findUnique({
    where: { slug: params.slug }
  });

  if (!ad) return { title: 'Advertisement Not Found' };

  return {
    title: `${ad.title} | MaziVastu`,
    description: ad.description || 'View advertisement details on MaziVastu.',
  };
}

export default async function PublicAdvertisementPage({ params }: { params: { slug: string } }) {
  const ad = await prisma.advertisement.findUnique({
    where: { slug: params.slug },
    include: {
      media: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (!ad || ad.status === 'INACTIVE' || ad.deletedAt) {
    notFound();
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--mv-bg)', paddingBottom: 'var(--mv-space-4xl)' }}>
      <style>{`
        .mv-inner-header-bg {
          background: url(/images/page-hero-bg.svg) center top no-repeat transparent;
          background-size: cover;
          padding-top: calc(var(--mv-space-4xl) + 60px);
          padding-bottom: 3rem;
          margin-bottom: 3rem;
          margin-top: -60px;
        }
        @media (min-width: 768px) {
          .mv-inner-header-bg {
            padding-top: calc(var(--mv-space-4xl) + 80px);
            margin-top: -80px;
          }
        }
      `}</style>
      
      {/* Hero Header Banner */}
      <div className="mv-inner-header-bg">
        <div className="mv-container">
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600, transition: 'color var(--mv-transition)' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h1 className="mv-heading-xl" style={{ color: 'var(--mv-text)', margin: 0 }}>
                {ad.title}
              </h1>
              <span className="mv-badge mv-badge-accent" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}>
                {ad.status.toLowerCase()}
              </span>
            </div>
            
            {ad.description && (
              <p className="mv-body" style={{ color: 'var(--mv-text-secondary)', maxWidth: '800px', fontSize: '1.125rem' }}>
                {ad.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mv-container">
        
        {/* Dates & Contact Info Bar */}
        <div className="mv-card" style={{ padding: '1.5rem', marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
          {ad.startDate && ad.endDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'var(--mv-bg-surface)', padding: '0.75rem', borderRadius: 'var(--mv-radius-sm)', color: 'var(--mv-accent)', border: '1px solid var(--mv-border)' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div className="mv-label" style={{ marginBottom: '0.25rem' }}>Campaign Period</div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--mv-text)', fontWeight: 600 }}>
                  {ad.startDate.toLocaleDateString()} to {ad.endDate.toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          
          {ad.contactName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'var(--mv-bg-surface)', padding: '0.75rem', borderRadius: 'var(--mv-radius-sm)', color: 'var(--mv-accent)', border: '1px solid var(--mv-border)' }}>
                <User size={20} />
              </div>
              <div>
                <div className="mv-label" style={{ marginBottom: '0.25rem' }}>Contact Person</div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--mv-text)', fontWeight: 600 }}>{ad.contactName}</div>
              </div>
            </div>
          )}
        </div>

        {/* Media Gallery (If any) */}
        {ad.media && ad.media.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 className="mv-heading-lg" style={{ color: 'var(--mv-text)', marginBottom: '1.5rem' }}>Gallery</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {ad.media.map(media => (
                <div key={media.id} className="mv-card" style={{ overflow: 'hidden', aspectRatio: '4/3', position: 'relative' }}>
                  {media.mediaType === 'IMAGE' ? (
                    <img src={media.publicUrl} alt="Ad media" className="mv-img-cover" />
                  ) : (
                    <video src={media.publicUrl} controls className="mv-img-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details & Contact Section */}
        <div className="mv-detail-grid">
          
          <div className="mv-card" style={{ padding: '2rem' }}>
            <h2 className="mv-heading-lg" style={{ color: 'var(--mv-text)', marginBottom: '1.5rem' }}>Project Information</h2>
            {ad.projectInformation ? (
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--mv-text-secondary)', lineHeight: 1.8, fontSize: '1rem' }}>
                {ad.projectInformation}
              </div>
            ) : (
              <p style={{ color: 'var(--mv-text-muted)', fontStyle: 'italic' }}>No detailed project information provided.</p>
            )}
          </div>

          <div className="mv-card" style={{ padding: '2rem', height: 'fit-content' }}>
            <h2 className="mv-heading-lg" style={{ color: 'var(--mv-text)', marginBottom: '1.5rem' }}>Contact Details</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ad.contactPhone ? (
                <a href={`tel:${ad.contactPhone}`} className="hover-scale" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--mv-text)', textDecoration: 'none', padding: '1.25rem', background: 'var(--mv-bg-surface)', borderRadius: 'var(--mv-radius-md)', border: '1px solid var(--mv-border)' }}>
                  <Phone size={20} color="var(--mv-accent)" />
                  <span style={{ fontWeight: 600 }}>{ad.contactPhone}</span>
                </a>
              ) : null}

              {ad.contactEmail ? (
                <a href={`mailto:${ad.contactEmail}`} className="hover-scale" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--mv-text)', textDecoration: 'none', padding: '1.25rem', background: 'var(--mv-bg-surface)', borderRadius: 'var(--mv-radius-md)', border: '1px solid var(--mv-border)' }}>
                  <Mail size={20} color="var(--mv-accent)" />
                  <span style={{ fontWeight: 600, wordBreak: 'break-all' }}>{ad.contactEmail}</span>
                </a>
              ) : null}

              {!ad.contactPhone && !ad.contactEmail && (
                <p style={{ color: 'var(--mv-text-muted)', fontSize: '0.875rem', background: 'var(--mv-bg-surface)', padding: '1rem', borderRadius: 'var(--mv-radius-md)', border: '1px solid var(--mv-border)' }}>
                  No direct contact details available for this advertisement.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
