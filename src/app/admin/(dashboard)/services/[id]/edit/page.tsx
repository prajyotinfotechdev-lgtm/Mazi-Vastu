import { prisma } from '@/lib/db/prisma';
import ServiceForm from '@/components/admin/ServiceForm';
import Link from 'next/link';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Edit Concierge Service | Admin Dashboard',
};

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const service = await prisma.alliedService.findUnique({
    where: { id: params.id, deletedAt: null }
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="admin-page-container">
      <style>{`
        .edit-header-premium {
          position: relative;
          padding: 2.5rem;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.9) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 2.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .back-link-premium {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 1.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255,255,255,0.05);
        }
        
        .back-link-premium:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
          transform: translateX(-4px);
          border-color: rgba(255,255,255,0.15);
        }
        
        .edit-title-premium {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .title-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f5c518 0%, #d4a000 100%);
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(245, 197, 24, 0.3);
        }
        
        .service-name-highlight {
          color: #f5c518;
          position: relative;
          display: inline-block;
        }
        .service-name-highlight::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(245, 197, 24, 0.3);
          border-radius: 2px;
        }
      `}</style>
      <div className="edit-header-premium">
        <Link href="/admin/services" className="back-link-premium">
          <ArrowLeft size={16} /> Back to Services
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="title-icon-wrapper">
            <Settings2 size={24} color="#0f172a" />
          </div>
          <div>
            <h1 className="edit-title-premium">Edit Concierge Service</h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>
              Updating details for <span className="service-name-highlight">{service.name}</span>
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <ServiceForm initialData={service} />
      </div>
    </div>
  );
}
