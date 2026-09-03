import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import React from 'react';
import { Plus, Edit, Tags } from 'lucide-react';
import DeletePropertyTypeButton from '@/components/admin/DeletePropertyTypeButton';
import Pagination from '@/components/admin/Pagination';

export const metadata = {
  title: 'Property Types | Admin Dashboard',
};

export default async function PropertyTypesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const PAGE_SIZE = 10;
  const [rootTypes, totalRootItems] = await Promise.all([
    prisma.propertyType.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    }),
    prisma.propertyType.count({ where: { isActive: true, parentId: null } })
  ]);

  const rootIds = rootTypes.map(r => r.id);
  
  const childTypes = await prisma.propertyType.findMany({
    where: { isActive: true, parentId: { in: rootIds } },
    orderBy: { sortOrder: 'asc' }
  });

  const propertyTypes = [...rootTypes, ...childTypes];
  const totalPages = Math.ceil(totalRootItems / PAGE_SIZE);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="mv-heading-xl" style={{ margin: '0 0 0.5rem 0' }}>Property Types</h1>
          <p style={{ color: 'var(--mv-text-secondary)', margin: 0 }}>Manage property categories and subcategories</p>
        </div>
        <Link
          href="/admin/property-types/new"
          className="mv-btn mv-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
        >
          <Plus size={18} /> Add Property Type
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
        {propertyTypes.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--mv-text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Tags size={32} opacity={0.3} />
              <p style={{ margin: 0, fontSize: '1.125rem', color: 'var(--mv-text)' }}>No property types found.</p>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>Create your first category to start organizing properties.</p>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--mv-bg-surface)', borderBottom: '1px solid var(--mv-border)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>Slug</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>Description</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--mv-text-secondary)', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rootTypes.map((root) => (
                  <React.Fragment key={root.id}>
                    <tr style={{ borderBottom: '1px solid var(--mv-border)', background: 'var(--mv-bg-elevated)' }} className="mv-admin-tr">
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--mv-text)' }}>{root.name}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>{root.slug}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>{root.description || '—'}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Link href={`/admin/property-types/${root.id}/edit`} className="mv-action-btn" title="Edit">
                            <Edit size={16} />
                          </Link>
                          <DeletePropertyTypeButton id={root.id} name={root.name} />
                        </div>
                      </td>
                    </tr>
                    
                    {/* Subtypes for this root */}
                    {propertyTypes.filter(sub => sub.parentId === root.id).map(sub => (
                      <tr key={sub.id} style={{ borderBottom: '1px solid var(--mv-border)' }} className="mv-admin-tr">
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--mv-text)', paddingLeft: '3rem' }}>
                          <span style={{ color: 'var(--mv-text-muted)', marginRight: '0.5rem' }}>↳</span>
                          {sub.name}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>{sub.slug}</td>
                        <td style={{ padding: '1rem 1.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>{sub.description || '—'}</td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Link href={`/admin/property-types/${sub.id}/edit`} className="mv-action-btn" title="Edit">
                              <Edit size={16} />
                            </Link>
                            <DeletePropertyTypeButton id={sub.id} name={sub.name} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {rootTypes.length > 0 && <Pagination totalPages={totalPages} />}
      </div>
    </div>
  );
}
