import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Megaphone } from 'lucide-react';
import DeleteAdvertisementButton from '@/components/admin/DeleteAdvertisementButton';
import Pagination from '@/components/admin/Pagination';
import AdvertisementsFilter from '@/components/admin/AdvertisementsFilter';

export default async function AdminAdvertisementsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string };
}) {
  const query = searchParams.q || '';
  const statusFilter = searchParams.status || '';
  const page = Number(searchParams.page) || 1;
  const PAGE_SIZE = 10;

  const validStatuses = ['DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED'];
  const status = validStatuses.includes(statusFilter) ? statusFilter as any : undefined;

  const whereClause = {
    deletedAt: null,
    ...(query ? { title: { contains: query, mode: 'insensitive' as const } } : {}),
    ...(status ? { status } : {})
  };

  const [advertisements, totalItems] = await Promise.all([
    prisma.advertisement.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.advertisement.count({ where: whereClause })
  ]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="mv-heading-xl" style={{ margin: 0 }}>
          Advertisements
        </h1>
        <Link 
          href="/admin/advertisements/new" 
          className="mv-btn mv-btn-primary"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            textDecoration: 'none',
          }}
        >
          <Plus size={18} />
          Create Ad
        </Link>
      </div>

      <style>{`
        .mv-admin-tr {
          transition: background-color 0.2s ease;
        }
        .mv-admin-tr:hover {
          background-color: rgba(255, 255, 255, 0.03);
        }
        .mv-action-btn {
          color: var(--mv-text-secondary);
          padding: 0.375rem;
          border-radius: 6px;
          display: flex;
          alignItems: center;
          transition: all 0.2s ease;
        }
        .mv-action-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--mv-text);
        }
      `}</style>
      <div className="mv-card" style={{ overflow: 'hidden', padding: 0 }}>
        {/* Toolbar */}
        <AdvertisementsFilter />

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--mv-bg-surface)', borderBottom: '1px solid var(--mv-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Title</th>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Campaign Dates</th>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Contact Info</th>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {advertisements.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--mv-text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Megaphone size={32} opacity={0.3} />
                      <p style={{ margin: 0, fontSize: '1.125rem', color: 'var(--mv-text)' }}>No advertisements found.</p>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>No ad campaigns match your current search.</p>
                    </div>
                  </td>
                </tr>
              )}
              {advertisements.map((ad) => (
                <tr key={ad.id} style={{ borderBottom: '1px solid var(--mv-border)' }} className="mv-admin-tr">
                  <td style={{ padding: '1rem', color: 'var(--mv-text)', fontWeight: 500 }}>
                    {ad.title}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`mv-badge ${ad.status === 'ACTIVE' ? 'mv-badge-accent' : ''}`} style={{ 
                      background: ad.status === 'DRAFT' ? 'var(--mv-bg-elevated)' : (ad.status === 'ACTIVE' ? undefined : 'rgba(239, 68, 68, 0.1)'), 
                      color: ad.status === 'DRAFT' ? 'var(--mv-text-secondary)' : (ad.status === 'ACTIVE' ? undefined : '#ef4444'), 
                      padding: '0.25rem 0.5rem', 
                      fontSize: '0.75rem'
                    }}>
                      {ad.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>
                    {ad.startDate ? ad.startDate.toLocaleDateString() : 'N/A'} - {ad.endDate ? ad.endDate.toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>
                    {ad.contactName || 'No Contact'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Link href={`/admin/advertisements/${ad.id}`} className="mv-action-btn" title="View Details">
                        <Eye size={16} />
                      </Link>
                      <Link href={`/admin/advertisements/${ad.id}/edit`} className="mv-action-btn" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <DeleteAdvertisementButton id={ad.id} title={ad.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}
