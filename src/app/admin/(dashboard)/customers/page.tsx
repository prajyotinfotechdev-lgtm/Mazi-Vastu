import { prisma } from '@/lib/db/prisma';
import Pagination from '@/components/admin/Pagination';
import CustomersFilter from '@/components/admin/CustomersFilter';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; source?: string; page?: string };
}) {
  const query = searchParams.q || '';
  const source = searchParams.source || '';
  const page = Number(searchParams.page) || 1;
  const PAGE_SIZE = 10;

  const whereClause: any = {
    ...(query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
      ]
    } : {}),
    ...(source ? { source: source as any } : {})
  };

  // 1. Group leads by phone to find unique customers
  const groupedLeads = await prisma.lead.groupBy({
    by: ['phone'],
    where: whereClause,
    _max: {
      createdAt: true
    }
  });

  // 2. Sort groups in memory by latest activity (createdAt DESC)
  groupedLeads.sort((a, b) => {
    const dateA = a._max.createdAt ? a._max.createdAt.getTime() : 0;
    const dateB = b._max.createdAt ? b._max.createdAt.getTime() : 0;
    return dateB - dateA;
  });

  // 3. Paginate the grouped results
  const totalItems = groupedLeads.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const paginatedPhones = groupedLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 4. Fetch full details for the paginated customers
  const customers = await Promise.all(
    paginatedPhones.map(async (group) => {
      const latestLead = await prisma.lead.findFirst({
        where: { phone: group.phone, ...whereClause },
        orderBy: { createdAt: 'desc' }
      });
      const totalInquiries = await prisma.lead.count({
        where: { phone: group.phone }
      });
      
      return {
        ...latestLead,
        totalInquiries
      };
    })
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="mv-heading-xl" style={{ margin: 0 }}>
          Customers
        </h1>
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
        {/* Filter Toolbar */}
        <CustomersFilter />

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--mv-border)', background: 'var(--mv-bg)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--mv-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--mv-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--mv-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Inquiries</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--mv-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Source</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--mv-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>First Contact</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--mv-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Contact</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--mv-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--mv-text-muted)' }}>
                    No customers found matching your filters.
                  </td>
                </tr>
              ) : (
                customers.map((customer, index) => customer && (
                  <tr key={customer.id || index} className="mv-admin-tr" style={{ borderBottom: '1px solid var(--mv-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--mv-text)' }}>{customer.name}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: 'var(--mv-text)' }}>{customer.phone}</div>
                      {customer.email && <div style={{ color: 'var(--mv-text-muted)', fontSize: '0.875rem' }}>{customer.email}</div>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        padding: '0.25rem 0.625rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        background: 'rgba(255,255,255,0.05)', 
                        color: 'var(--mv-text-accent)'
                      }}>
                        {customer.totalInquiries}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        padding: '0.25rem 0.625rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 500, 
                        background: 'var(--mv-bg)', 
                        color: 'var(--mv-text-secondary)'
                      }}>
                        {customer.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>
                      {/* Since we grouped, we don't have first seen easily, but latest contact is createdAt of this latest lead */}
                      {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link 
                        href={`/admin/customers/${encodeURIComponent(customer.phone)}`}
                        className="mv-action-btn"
                        style={{ display: 'inline-flex', textDecoration: 'none' }}
                        title="View Customer Details"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--mv-border)', background: 'var(--mv-bg)' }}>
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
