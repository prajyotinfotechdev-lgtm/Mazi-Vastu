import { prisma } from '@/lib/db/prisma';
import { Flame, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import DeleteUrgentPropertyButton from '@/components/admin/DeleteUrgentPropertyButton';
import UrgentPropertyForm from '@/components/admin/UrgentPropertyForm';

export const metadata = {
  title: 'Urgent + Rent Properties | Admin Dashboard',
};

export default async function UrgentPropertiesAdminPage() {
  const urgentProperties = await prisma.urgentProperty.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="admin-page-container" style={{ padding: '2rem' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .premium-header {
          position: relative;
          padding: 2.5rem;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%);
          overflow: hidden;
          margin-bottom: 2.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .premium-title {
          font-size: 2.25rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(to right, #ffffff, #f5c518);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .premium-subtitle {
          color: #94a3b8;
          margin: 0;
          font-size: 1rem;
        }
        .urgent-card {
          background: var(--mv-bg-surface, #1e293b);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          transition: all 0.2s ease;
        }
        .urgent-card:hover {
          border-color: rgba(245, 197, 24, 0.3);
          transform: translateY(-2px);
        }
        .location-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(245, 197, 24, 0.1);
          color: #f5c518;
          border: 1px solid rgba(245, 197, 24, 0.25);
          padding: 0.3rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        `
      }} />

      <div className="premium-header">
        <div>
          <h1 className="premium-title">
            <Flame size={32} color="#f5c518" /> Urgent + Rent Properties
          </h1>
          <p className="premium-subtitle">
            Upload text-only property details for specified locations (Ausa Road, Barshi Road, Ambejogai Road, Nanded Road).
          </p>
        </div>
        <UrgentPropertyForm />
      </div>

      {urgentProperties.length === 0 ? (
        <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'var(--mv-bg-surface, #1e293b)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Flame size={48} color="#f5c518" style={{ marginBottom: '1rem', opacity: 0.7 }} />
          <h3 style={{ color: '#ffffff', margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>No Urgent Properties Posted</h3>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
            Click "Add Urgent Property" above to create text-only property posts for your website home page.
          </p>
        </div>
      ) : (
        <div>
          {urgentProperties.map((prop) => (
            <div key={prop.id} className="urgent-card">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span className="location-badge">
                    <MapPin size={13} />
                    {prop.location}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} />
                    {new Date(prop.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={13} /> Active
                  </span>
                </div>
                <p style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {prop.title}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DeleteUrgentPropertyButton id={prop.id} title={prop.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
