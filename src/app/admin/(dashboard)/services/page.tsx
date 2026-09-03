import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Plus, Edit, Wrench, Sparkles, Phone, Tag, ShieldCheck } from 'lucide-react';
import DeleteServiceButton from '@/components/admin/DeleteServiceButton';
import Pagination from '@/components/admin/Pagination';

export const metadata = {
  title: 'Concierge Services | Admin Dashboard',
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const PAGE_SIZE = 10;
  const whereClause = { deletedAt: null };

  const [services, totalItems] = await Promise.all([
    prisma.alliedService.findMany({
      where: whereClause,
      orderBy: { sortOrder: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.alliedService.count({ where: whereClause })
  ]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="admin-page-container">
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
        .premium-header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(245,197,24,0.15) 0%, transparent 60%);
          animation: rotate 20s linear infinite;
        }
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .header-content {
          position: relative;
          z-index: 1;
        }
        .premium-title {
          font-size: 2.5rem;
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
          font-size: 1.125rem;
          font-weight: 400;
        }
        .btn-add-premium {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #f5c518 0%, #d4a000 100%);
          color: #0f172a;
          font-weight: 700;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(245, 197, 24, 0.3);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .btn-add-premium:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 25px rgba(245, 197, 24, 0.5);
          background: linear-gradient(135deg, #ffd740 0%, #e6b800 100%);
        }
        
        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .service-card {
          background: var(--mv-bg-surface);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        
        .service-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
          border-color: rgba(245, 197, 24, 0.3);
        }
        
        .service-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #f5c518, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .service-card:hover::after {
          opacity: 1;
        }
        
        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .service-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--mv-text);
          margin-bottom: 0.25rem;
        }
        .service-slug {
          font-size: 0.85rem;
          color: var(--mv-text-muted);
          font-family: monospace;
        }
        
        .badge-premium {
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        .badge-active {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .badge-inactive {
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
        
        .service-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }
        
        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--mv-text-secondary);
          font-size: 0.95rem;
        }
        
        .detail-icon {
          color: #f5c518;
          opacity: 0.8;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(245, 197, 24, 0.1);
          border-radius: 6px;
        }
        
        .card-actions {
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--mv-border);
        }
        
        .action-btn-premium {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .edit-btn {
          background: rgba(255,255,255,0.05);
          color: var(--mv-text);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .edit-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
        `
      }} />

      <div className="premium-header">
        <div className="header-content">
          <h1 className="premium-title">
            <Sparkles size={32} color="#f5c518" /> Concierge Services
          </h1>
          <p className="premium-subtitle">Manage premium WhatsApp services for your customers.</p>
        </div>
        <Link href="/admin/services/new" className="btn-add-premium">
          <Plus size={20} strokeWidth={2.5} /> Create Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--mv-bg-surface)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(245, 197, 24, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={40} color="#f5c518" />
            </div>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--mv-text)' }}>No services found</p>
              <p style={{ margin: 0, fontSize: '1rem', color: 'var(--mv-text-muted)' }}>Create your first elite concierge service to get started.</p>
            </div>
            <Link href="/admin/services/new" className="btn-add-premium" style={{ marginTop: '1rem' }}>
              <Plus size={20} /> Add First Service
            </Link>
          </div>
        </div>
      ) : (
        <div className="services-grid">
          {services.map((svc) => (
            <div key={svc.id} className="service-card">
              <div className="service-header">
                <div>
                  <div className="service-name">{svc.name}</div>
                  <div className="service-slug">/{svc.slug}</div>
                </div>
                <div className={`badge-premium ${svc.isActive ? 'badge-active' : 'badge-inactive'}`}>
                  {svc.isActive ? <ShieldCheck size={14} /> : null}
                  {svc.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <div className="service-details">
                <div className="detail-item">
                  <div className="detail-icon"><Tag size={14} /></div>
                  <span style={{ fontWeight: 600, color: 'var(--mv-text)' }}>
                    {svc.price ? `₹${svc.price}` : 'Free'}
                  </span>
                  {svc.priceUnit && <span style={{ color: 'var(--mv-text-muted)' }}>{svc.priceUnit}</span>}
                </div>
                <div className="detail-item">
                  <div className="detail-icon"><Phone size={14} /></div>
                  <span style={{ fontFamily: 'monospace' }}>+{svc.whatsappNumber}</span>
                </div>
              </div>
              
              <div className="card-actions">
                <Link href={`/admin/services/${svc.id}/edit`} className="action-btn-premium edit-btn">
                  <Edit size={16} /> Edit Details
                </Link>
                <div style={{ flex: '0 0 auto' }}>
                  <DeleteServiceButton id={svc.id} name={svc.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {services.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}

