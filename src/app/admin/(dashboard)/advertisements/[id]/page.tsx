import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Phone, Mail, FileText, ImageIcon } from 'lucide-react';

export default async function AdminAdvertisementDetailsPage({ params }: { params: { id: string } }) {
  const ad = await prisma.advertisement.findUnique({
    where: { id: params.id },
    include: {
      media: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (!ad) {
    notFound();
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/advertisements" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Advertisements
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="mv-heading-xl" style={{ margin: 0 }}>
            {ad.title}
          </h1>
          <span className={`mv-badge ${ad.status === 'ACTIVE' ? 'mv-badge-accent' : ''}`} style={{ 
            background: ad.status === 'DRAFT' ? 'var(--mv-bg-elevated)' : (ad.status === 'ACTIVE' ? undefined : 'rgba(239, 68, 68, 0.1)'), 
            color: ad.status === 'DRAFT' ? 'var(--mv-text-secondary)' : (ad.status === 'ACTIVE' ? undefined : '#ef4444'), 
            padding: '0.5rem 1rem', 
            fontSize: '0.875rem', 
            textTransform: 'capitalize'
          }}>
            {ad.status.toLowerCase()}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Details & Media */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="mv-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--mv-text)', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} style={{ color: 'var(--mv-accent)' }} /> Base Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <Calendar size={14} /> Start Date
                </div>
                <div style={{ color: 'var(--mv-text)', fontWeight: 500, fontSize: '1.125rem' }}>
                  {ad.startDate ? ad.startDate.toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <Calendar size={14} /> End Date
                </div>
                <div style={{ color: 'var(--mv-text)', fontWeight: 500, fontSize: '1.125rem' }}>
                  {ad.endDate ? ad.endDate.toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <div style={{ color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Description
              </div>
              <p style={{ color: 'var(--mv-text)', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                {ad.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--mv-border)' }}>
              <div style={{ color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Project Information
              </div>
              <div style={{ color: 'var(--mv-text)', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                {ad.projectInformation || 'No specific project information provided.'}
              </div>
            </div>
          </div>

          <div className="mv-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--mv-text)', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={20} style={{ color: 'var(--mv-accent)' }} /> Media Gallery
            </h3>
            {ad.media && ad.media.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {ad.media.map(item => (
                  <div key={item.id} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--mv-border)' }}>
                    {item.mediaType === 'IMAGE' ? (
                      <img src={item.publicUrl} alt="Advertisement media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <video src={item.publicUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--mv-text-muted)', margin: 0, fontStyle: 'italic' }}>No media uploaded for this advertisement.</p>
            )}
          </div>
        </div>

        {/* Right Column: Contact Info & Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="mv-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--mv-text)', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} style={{ color: 'var(--mv-accent)' }} /> Contact Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <User size={14} /> Name
                </div>
                <div style={{ color: 'var(--mv-text)', fontWeight: 500 }}>
                  {ad.contactName || 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <Phone size={14} /> Phone
                </div>
                <div style={{ color: 'var(--mv-text)', fontWeight: 500 }}>
                  {ad.contactPhone || 'N/A'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <Mail size={14} /> Email
                </div>
                <div style={{ color: 'var(--mv-text)', fontWeight: 500 }}>
                  {ad.contactEmail || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="mv-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--mv-border)' }}>
              <span style={{ color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>Created At</span>
              <span style={{ color: 'var(--mv-text)', fontSize: '0.875rem', fontWeight: 500 }}>{ad.createdAt.toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>Updated At</span>
              <span style={{ color: 'var(--mv-text)', fontSize: '0.875rem', fontWeight: 500 }}>{ad.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
