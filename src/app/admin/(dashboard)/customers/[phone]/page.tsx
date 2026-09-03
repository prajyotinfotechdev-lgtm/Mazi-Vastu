import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, Clock, Calendar, ShieldCheck, Activity } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function CustomerDetailsPage({ params }: { params: { phone: string } }) {
  const phone = decodeURIComponent(params.phone);
  
  const leads = await prisma.lead.findMany({
    where: { phone },
    orderBy: { createdAt: 'desc' }
  });

  if (leads.length === 0) {
    notFound();
  }

  const latestLead = leads[0];
  const firstContactDate = leads[leads.length - 1].createdAt;
  const latestContactDate = latestLead.createdAt;

  // Bulk fetch related entities
  const propertyIds = [...new Set(leads.map(l => l.propertyId).filter(Boolean) as string[])];
  const serviceIds = [...new Set(leads.map(l => l.serviceId).filter(Boolean) as string[])];

  const [properties, services] = await Promise.all([
    propertyIds.length > 0 ? prisma.property.findMany({
      where: { id: { in: propertyIds } },
      select: { id: true, title: true, slug: true, status: true, price: true }
    }) : Promise.resolve([]),
    serviceIds.length > 0 ? prisma.alliedService.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true, slug: true }
    }) : Promise.resolve([])
  ]);

  const propertyMap = properties.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as Record<string, any>);
  const serviceMap = services.reduce((acc, s) => ({ ...acc, [s.id]: s }), {} as Record<string, any>);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link 
          href="/admin/customers"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--mv-bg-surface)',
            color: 'var(--mv-text)',
            textDecoration: 'none',
            border: '1px solid var(--mv-border)',
            transition: 'all 0.2s ease'
          }}
          className="mv-back-btn"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="mv-heading-xl" style={{ margin: 0 }}>
            Customer Details
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: 'var(--mv-text-muted)', fontSize: '0.875rem' }}>
            A complete history of interactions with {latestLead.name}
          </p>
        </div>
      </div>

      <style>{`
        .mv-back-btn:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }
        .mv-timeline-item {
          position: relative;
          padding-left: 2rem;
          padding-bottom: 2rem;
        }
        .mv-timeline-item::before {
          content: '';
          position: absolute;
          left: 6px;
          top: 24px;
          bottom: 0;
          width: 2px;
          background: var(--mv-border);
        }
        .mv-timeline-item:last-child::before {
          display: none;
        }
        .mv-timeline-dot {
          position: absolute;
          left: 0;
          top: 4px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--mv-accent);
          border: 2px solid var(--mv-bg);
          box-shadow: 0 0 0 2px var(--mv-border);
        }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Left Column: Customer Profile Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Profile Card */}
          <div className="mv-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.75rem' }}>
              <User size={18} color="var(--mv-accent)" />
              Profile Overview
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ color: 'var(--mv-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Full Name</div>
                <div style={{ fontWeight: 500, fontSize: '1rem', color: 'var(--mv-text)' }}>{latestLead.name}</div>
              </div>
              
              <div>
                <div style={{ color: 'var(--mv-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Phone Number</div>
                <div style={{ fontWeight: 500, fontSize: '1rem', color: 'var(--mv-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} /> {latestLead.phone}
                </div>
              </div>
              
              {latestLead.email && (
                <div>
                  <div style={{ color: 'var(--mv-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Email Address</div>
                  <div style={{ fontWeight: 500, fontSize: '1rem', color: 'var(--mv-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={14} /> {latestLead.email}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="mv-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.75rem' }}>
              <Activity size={18} color="var(--mv-accent)" />
              Engagement Stats
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'var(--mv-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--mv-border)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--mv-accent)' }}>{leads.length}</div>
                <div style={{ color: 'var(--mv-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>Total Inquiries</div>
              </div>
              
              <div style={{ background: 'var(--mv-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--mv-border)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--mv-text)' }}>
                  {new Set(leads.map(l => l.source)).size}
                </div>
                <div style={{ color: 'var(--mv-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.25rem' }}>Channels Used</div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--mv-text-muted)', fontSize: '0.875rem' }}>First Contacted</span>
                <span style={{ color: 'var(--mv-text)', fontSize: '0.875rem', fontWeight: 500 }}>
                  {new Date(firstContactDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--mv-text-muted)', fontSize: '0.875rem' }}>Last Contacted</span>
                <span style={{ color: 'var(--mv-text)', fontSize: '0.875rem', fontWeight: 500 }}>
                  {new Date(latestContactDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiries Timeline */}
        <div className="mv-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.75rem' }}>
            <Clock size={18} color="var(--mv-accent)" />
            Inquiry History
          </h3>
          
          <div>
            {leads.map((lead, i) => {
              let statusColor = 'var(--mv-text-secondary)';
              if (lead.status === 'NEW') statusColor = '#3b82f6';
              if (lead.status === 'CONTACTED') statusColor = '#eab308';
              if (lead.status === 'IN_PROGRESS') statusColor = '#a855f7';
              if (lead.status === 'CLOSED') statusColor = '#22c55e';
              if (lead.status === 'REJECTED') statusColor = '#ef4444';

              return (
                <div key={lead.id} className="mv-timeline-item">
                  <div className="mv-timeline-dot" style={{ background: statusColor }} />
                  
                  <div style={{ background: 'var(--mv-bg)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--mv-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ 
                          display: 'inline-block',
                          padding: '0.25rem 0.625rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          background: 'rgba(255,255,255,0.05)', 
                          color: 'var(--mv-text-secondary)',
                          textTransform: 'uppercase',
                          marginBottom: '0.5rem'
                        }}>
                          {lead.source.replace('_', ' ')}
                        </div>
                        <div style={{ color: 'var(--mv-text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} />
                          {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      <div style={{ 
                        padding: '0.25rem 0.625rem', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        color: statusColor,
                        border: `1px solid ${statusColor}40`,
                        background: `${statusColor}10`
                      }}>
                        {lead.status.replace('_', ' ')}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                      {lead.propertyId && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--mv-border)' }}>
                          <div style={{ color: 'var(--mv-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Property Interest</div>
                          {propertyMap[lead.propertyId] ? (
                            <div>
                              <div style={{ fontWeight: 500, color: 'var(--mv-text)', marginBottom: '0.25rem' }}>
                                {propertyMap[lead.propertyId].title}
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--mv-text-secondary)', background: 'var(--mv-bg)', padding: '0.125rem 0.375rem', borderRadius: '4px', border: '1px solid var(--mv-border)' }}>
                                  {propertyMap[lead.propertyId].status}
                                </span>
                                {propertyMap[lead.propertyId].price && (
                                  <span style={{ fontSize: '0.875rem', color: 'var(--mv-text-accent)' }}>
                                    ₹{propertyMap[lead.propertyId].price.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                              <Link href={`/properties/${propertyMap[lead.propertyId].slug}`} target="_blank" style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--mv-accent)', textDecoration: 'none', fontWeight: 500 }}>
                                View Property →
                              </Link>
                            </div>
                          ) : (
                            <div style={{ fontFamily: 'monospace', color: 'var(--mv-text-muted)' }}>ID: {lead.propertyId} (Not Found)</div>
                          )}
                        </div>
                      )}
                      
                      {lead.serviceId && (
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--mv-border)' }}>
                          <div style={{ color: 'var(--mv-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Service Inquiry</div>
                          {serviceMap[lead.serviceId] ? (
                            <div>
                              <div style={{ fontWeight: 500, color: 'var(--mv-text)' }}>
                                {serviceMap[lead.serviceId].name}
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontFamily: 'monospace', color: 'var(--mv-text-muted)' }}>ID: {lead.serviceId} (Not Found)</div>
                          )}
                        </div>
                      )}

                      {lead.notes && (
                        <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                          <div style={{ color: 'var(--mv-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Admin Notes</div>
                          <div style={{ color: 'var(--mv-text-secondary)', fontSize: '0.875rem', background: 'var(--mv-bg)', padding: '1rem', borderRadius: '6px', border: '1px dashed var(--mv-border)', whiteSpace: 'pre-wrap' }}>
                            {lead.notes}
                          </div>
                        </div>
                      )}
                      
                      {lead.metadata && Object.keys(lead.metadata).length > 0 && (
                        <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                          <div style={{ color: 'var(--mv-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Additional Metadata</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', background: 'var(--mv-bg)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--mv-border)' }}>
                            {Object.entries(lead.metadata as Record<string, any>).map(([key, value]) => (
                              <div key={key}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--mv-text-secondary)', marginBottom: '0.25rem' }}>{key}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--mv-text)', wordBreak: 'break-all' }}>
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
