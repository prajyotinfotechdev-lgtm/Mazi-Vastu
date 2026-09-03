import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Plus, Search, Edit, Eye } from 'lucide-react';
import DeletePropertyButton from '@/components/admin/DeletePropertyButton';
import Pagination from '@/components/admin/Pagination';
import PropertiesFilter from '@/components/admin/PropertiesFilter';

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; status?: string; propertyTypeId?: string; location?: string };
}) {
  const query = searchParams.q || '';
  const page = Number(searchParams.page) || 1;
  const status = searchParams.status as any;
  const propertyTypeId = searchParams.propertyTypeId;
  const location = searchParams.location;
  const PAGE_SIZE = 10;

  const whereClause: any = {
    deletedAt: null,
    ...(query ? { title: { contains: query, mode: 'insensitive' as const } } : {}),
    ...(status ? { status } : {}),
    ...(propertyTypeId ? { propertyTypeId } : {}),
    ...(location ? { approximateLocation: location } : {}),
  };

  const [properties, totalItems, propertyTypes, locationData] = await Promise.all([
    prisma.property.findMany({
      where: whereClause,
      include: {
        propertyType: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.property.count({ where: whereClause }),
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
    })
  ]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const locations = locationData.map(l => l.approximateLocation as string).filter(Boolean).sort();



  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="mv-heading-xl" style={{ margin: 0 }}>
          Properties
        </h1>
        <Link 
          href="/admin/properties/new" 
          className="mv-btn mv-btn-primary"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            textDecoration: 'none',
          }}
        >
          <Plus size={18} />
          Add Property
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
        <PropertiesFilter propertyTypes={propertyTypes} locations={locations} />

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--mv-bg-surface)', borderBottom: '1px solid var(--mv-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Title</th>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Category</th>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Price</th>
                <th style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--mv-text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Search size={32} opacity={0.3} />
                      <p style={{ margin: 0, fontSize: '1.125rem', color: 'var(--mv-text)' }}>No properties found.</p>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>Try adjusting your search query.</p>
                    </div>
                  </td>
                </tr>
              )}
              {properties.map((property) => (
                <tr key={property.id} style={{ borderBottom: '1px solid var(--mv-border)' }} className="mv-admin-tr">
                  <td style={{ padding: '1rem', color: 'var(--mv-text)', fontWeight: 500 }}>
                    {property.title}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>
                    {property.propertyType.name}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`mv-badge ${property.status === 'PUBLISHED' ? 'mv-badge-accent' : ''}`} style={{ 
                      background: property.status === 'DRAFT' ? 'var(--mv-bg-elevated)' : (property.status === 'PUBLISHED' ? undefined : 'rgba(239, 68, 68, 0.1)'), 
                      color: property.status === 'DRAFT' ? 'var(--mv-text-secondary)' : (property.status === 'PUBLISHED' ? undefined : '#ef4444'), 
                      padding: '0.25rem 0.5rem', 
                      fontSize: '0.75rem'
                    }}>
                      {property.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--mv-text)', fontWeight: 500 }}>
                    ₹{property.price.toLocaleString('en-IN')}
                    {property.priceType !== 'FIXED' && <span style={{ fontSize: '0.75rem', color: 'var(--mv-text-secondary)', marginLeft: '4px' }}>({property.priceType})</span>}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Link href={`/admin/properties/${property.id}`} className="mv-action-btn" title="View Details">
                        <Eye size={16} />
                      </Link>
                      <Link href={`/admin/properties/${property.id}/edit`} className="mv-action-btn" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <DeletePropertyButton id={property.id} title={property.title} />
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
