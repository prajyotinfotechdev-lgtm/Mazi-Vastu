import { prisma } from '@/lib/db/prisma';
import { Building2, Megaphone, Users, ArrowRight, TrendingUp, Calendar, Phone, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardHome() {
  // Fetch some metrics for the dashboard
  const [
    propertiesCount,
    activeAdsCount,
    leadsCount,
    recentLeads
  ] = await Promise.all([
    prisma.property.count({ where: { deletedAt: null } }),
    prisma.advertisement.count({ where: { status: 'ACTIVE', deletedAt: null } }),
    prisma.lead.count(),
    prisma.lead.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: { id: true, source: true, status: true, name: true, phone: true, createdAt: true }
    })
  ]);

  // Format today's date
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <style>{`
        .mv-metric-card {
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mv-metric-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
        .mv-metric-card-properties:hover {
          box-shadow: 0 12px 24px -10px rgba(0,0,0,0.8), 0 0 20px -5px rgba(255, 255, 255, 0.1);
        }
        .mv-metric-card-ads:hover {
          box-shadow: 0 12px 24px -10px rgba(0,0,0,0.8), 0 0 20px -5px rgba(245, 197, 24, 0.15);
        }
        .mv-metric-card-leads:hover {
          box-shadow: 0 12px 24px -10px rgba(0,0,0,0.8), 0 0 20px -5px rgba(59, 130, 246, 0.15);
        }
        .mv-admin-tr {
          transition: background-color 0.2s ease;
        }
        .mv-admin-tr:hover {
          background-color: rgba(255, 255, 255, 0.03);
        }
      `}</style>
      
      {/* Header Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1.5rem' }}>
        <div>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-accent)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <Calendar size={14} />
            {today}
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--mv-text)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Dashboard Overview
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            href="/admin/properties/new" 
            className="mv-btn mv-btn-secondary"
            style={{ borderRadius: '8px' }}
          >
            <Building2 size={16} /> Add Property
          </Link>
          <Link 
            href="/admin/advertisements/new" 
            className="mv-btn mv-btn-primary"
            style={{ borderRadius: '8px', boxShadow: '0 4px 14px rgba(245, 197, 24, 0.2)' }}
          >
            <Megaphone size={16} /> Create Campaign
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        
        {/* Metric 1 */}
        <Link href="/admin/properties" className="mv-card mv-metric-card mv-metric-card-properties" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(145deg, var(--mv-bg-elevated) 0%, var(--mv-bg-card) 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, color: 'var(--mv-text)' }}>
            <Building2 size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--mv-text-secondary)' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--mv-text)' }}>
              <Building2 size={20} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Total Properties</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--mv-text)', lineHeight: 1 }}>{propertiesCount}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4ade80', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <TrendingUp size={14} /> Active
            </span>
          </div>
        </Link>

        {/* Metric 2 */}
        <Link href="/admin/advertisements" className="mv-card mv-metric-card mv-metric-card-ads" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(145deg, var(--mv-bg-elevated) 0%, var(--mv-bg-card) 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, color: 'var(--mv-text)' }}>
            <Megaphone size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--mv-text-secondary)' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(245, 197, 24, 0.1)', borderRadius: '8px', color: 'var(--mv-accent)' }}>
              <Megaphone size={20} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Active Ads</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--mv-text)', lineHeight: 1 }}>{activeAdsCount}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--mv-accent)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
               Running
            </span>
          </div>
        </Link>

        {/* Metric 3 */}
        <Link href="/admin/leads" className="mv-card mv-metric-card mv-metric-card-leads" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(145deg, var(--mv-bg-elevated) 0%, var(--mv-bg-card) 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, color: 'var(--mv-text)' }}>
            <Users size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--mv-text-secondary)' }}>
            <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: '#3b82f6' }}>
              <Users size={20} />
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Total Leads</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--mv-text)', lineHeight: 1 }}>{leadsCount}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
               Captured
            </span>
          </div>
        </Link>
      </div>

      {/* Recent Leads Table */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--mv-text)', margin: 0 }}>
              Recent Leads
            </h2>
            <p style={{ color: 'var(--mv-text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              The latest inquiries across all channels.
            </p>
          </div>
          <Link 
            href="/admin/leads" 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.25rem', 
              color: 'var(--mv-accent)', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' 
            }}
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mv-card" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'var(--mv-bg-elevated)', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visitor Details</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--mv-text-secondary)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--mv-text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Users size={32} opacity={0.5} />
                        <p>No recent leads found.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {recentLeads.map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }} className="mv-admin-tr">
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ color: 'var(--mv-text)', fontWeight: 600 }}>{lead.name || 'Unknown User'}</span>
                        <span style={{ color: 'var(--mv-text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Phone size={12} /> {lead.phone || 'No Phone'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        background: 'var(--mv-bg)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--mv-text)', padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 
                      }}>
                        <LinkIcon size={12} style={{ color: 'var(--mv-text-muted)' }} />
                        {lead.source.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center',
                        background: lead.status === 'NEW' ? 'rgba(245, 197, 24, 0.1)' : 'rgba(34, 197, 94, 0.1)', 
                        color: lead.status === 'NEW' ? 'var(--mv-accent)' : '#4ade80', 
                        border: lead.status === 'NEW' ? '1px solid rgba(245, 197, 24, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)',
                        padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em'
                      }}>
                        {lead.status === 'NEW' ? '● ' : '✓ '}{lead.status}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <Link 
                        href={`/admin/leads?status=${lead.status}`}
                        className="mv-btn mv-btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '6px' }}
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
