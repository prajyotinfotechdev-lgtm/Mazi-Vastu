import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Search, Eye, Phone, Mail, Users } from 'lucide-react';
import Pagination from '@/components/admin/Pagination';
import LeadsFilter from '@/components/admin/LeadsFilter';

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; page?: string; source?: string; propertyTypeId?: string; location?: string; dateRange?: string; serviceId?: string };
}) {
  const query = searchParams.q || '';
  const statusFilter = searchParams.status || '';
  const sourceFilter = searchParams.source || 'PROPERTY_INTEREST';
  const propertyTypeId = searchParams.propertyTypeId || '';
  const location = searchParams.location || '';
  const dateRange = searchParams.dateRange || '';
  const serviceId = searchParams.serviceId || '';
  const page = Number(searchParams.page) || 1;
  const PAGE_SIZE = 10;

  const validSources = ['PROPERTY_INTEREST', 'CONSULTATION', 'SERVICE_CONTACT'];
  const activeSource = validSources.includes(sourceFilter) ? sourceFilter as any : 'PROPERTY_INTEREST';

  // Ensure type safety for status filter
  const validStatuses = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED', 'REJECTED'];
  const status = validStatuses.includes(statusFilter) ? statusFilter as any : undefined;

  let validPropertyIds: string[] | undefined = undefined;
  if (propertyTypeId || location) {
    const matchedProps = await prisma.property.findMany({
      where: {
        ...(propertyTypeId ? { propertyTypeId } : {}),
        ...(location ? { approximateLocation: location } : {})
      },
      select: { id: true }
    });
    validPropertyIds = matchedProps.map(p => p.id);
  }

  let dateFilter: any = undefined;
  if (dateRange) {
    const now = new Date();
    if (dateRange === 'TODAY') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { gte: startOfDay };
    } else if (dateRange === 'LAST_7_DAYS') {
      const last7Days = new Date(now);
      last7Days.setDate(last7Days.getDate() - 7);
      dateFilter = { gte: last7Days };
    } else if (dateRange === 'THIS_MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { gte: startOfMonth };
    }
  }

  const whereClause: any = {
    source: activeSource,
    ...(query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query, mode: 'insensitive' as const } },
      ]
    } : {}),
    ...(status ? { status } : {}),
    ...(validPropertyIds ? { propertyId: { in: validPropertyIds } } : {}),
    ...(serviceId ? { serviceId } : {}),
    ...(dateFilter ? { createdAt: dateFilter } : {})
  };

  const [leads, totalItems, propertyTypes, locationData, allServices] = await Promise.all([
    prisma.lead.findMany({
      where: whereClause,
      include: { visitor: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.lead.count({ where: whereClause }),
    prisma.propertyType.findMany({
      where: { deletedAt: null, parentId: null },
      select: { 
        id: true, 
        name: true,
        children: {
          where: { deletedAt: null },
          select: { id: true, name: true },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.property.findMany({
      where: { deletedAt: null, approximateLocation: { not: null } },
      select: { approximateLocation: true },
      distinct: ['approximateLocation']
    }),
    prisma.alliedService.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const locations = locationData.map(l => l.approximateLocation as string).filter(Boolean).sort();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="mv-heading-xl" style={{ margin: 0 }}>
          Leads & Consultations
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--mv-border)' }}>
        {validSources.map(s => (
          <Link 
            key={s} 
            href={`/admin/leads?source=${s}`}
            style={{
              padding: '0.75rem 1rem',
              color: activeSource === s ? 'var(--mv-accent)' : 'var(--mv-text-secondary)',
              borderBottom: activeSource === s ? '2px solid var(--mv-accent)' : '2px solid transparent',
              textDecoration: 'none',
              fontWeight: activeSource === s ? 600 : 500,
              fontSize: '0.875rem',
              textTransform: 'capitalize'
            }}
          >
            {s.replace('_', ' ').toLowerCase()}
          </Link>
        ))}
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
          border: none;
          background: none;
          cursor: pointer;
        }
        .mv-action-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--mv-text);
        }
      `}</style>
      <div className="mv-card" style={{ overflow: 'hidden', padding: 0 }}>
        {/* Toolbar */}
        <LeadsFilter propertyTypes={propertyTypes} locations={locations} services={allServices} />

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--mv-bg-surface)', borderBottom: '1px solid var(--mv-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Contact Info</th>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--mv-text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Users size={32} opacity={0.3} />
                      <p style={{ margin: 0, fontSize: '1.125rem', color: 'var(--mv-text)' }}>No leads found.</p>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>No leads match your current search or filter criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--mv-border)' }} className="mv-admin-tr">
                  <td style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>
                    {lead.createdAt.toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--mv-text)', fontWeight: 500, marginBottom: '0.25rem' }}>{lead.name || 'Unknown'}</div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--mv-text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={12} /> {lead.phone || 'Unknown'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`mv-badge ${lead.status === 'NEW' ? 'mv-badge-accent' : ''}`} style={{ 
                      background: lead.status !== 'NEW' ? 'var(--mv-bg-elevated)' : undefined, 
                      color: lead.status !== 'NEW' ? 'var(--mv-text-secondary)' : undefined, 
                      padding: '0.25rem 0.5rem', 
                      fontSize: '0.75rem'
                    }}>
                      {lead.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Link href={`/admin/leads/${lead.id}`} className="mv-action-btn" title="View Lead Details">
                        <Eye size={18} />
                      </Link>
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
