import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, Calendar, Info } from 'lucide-react';
import LeadDetailsClient from '@/components/admin/LeadDetailsClient';

export default async function AdminLeadDetailsPage({ params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
  });

  if (!lead) {
    notFound();
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/leads" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem' }}>
          <ArrowLeft size={16} /> Back to Leads
        </Link>
        <h1 className="mv-heading-xl" style={{ margin: 0 }}>
          Lead Profile
        </h1>
      </div>

      <div className="mv-card">
        
        {/* Contact Info Card */}
        <div style={{ background: 'var(--mv-bg-elevated)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--mv-border)', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <User size={14} /> Name
              </div>
              <div style={{ color: 'var(--mv-text)', fontWeight: 500, fontSize: '1.125rem' }}>{lead.name}</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <Phone size={14} /> Phone
              </div>
              <div style={{ color: 'var(--mv-text)', fontWeight: 500, fontSize: '1.125rem' }}>{lead.phone}</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <Mail size={14} /> Email
              </div>
              <div style={{ color: 'var(--mv-text)', fontWeight: 500, fontSize: '1.125rem' }}>{lead.email || 'N/A'}</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                <Calendar size={14} /> Received On
              </div>
              <div style={{ color: 'var(--mv-text)', fontWeight: 500, fontSize: '1.125rem' }}>
                {lead.createdAt.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Lead Inquiry Source */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--mv-text)', borderBottom: '1px solid var(--mv-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Inquiry Context
        </h3>
        
        {/* Source Badge */}
        <div className="mv-badge mv-badge-accent" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
          {lead.source.replace('_', ' ')}
        </div>

        {/* Dynamic Context Card */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'var(--mv-bg-elevated)', border: '1px solid var(--mv-border)', padding: '1.5rem', borderRadius: '12px', color: 'var(--mv-text-secondary)' }}>
          <Info size={24} style={{ color: 'var(--mv-accent)', flexShrink: 0 }} />
          <div style={{ width: '100%' }}>
            
            {/* PROPERTY INTEREST */}
            {lead.source === 'PROPERTY_INTEREST' && (
              <>
                <div style={{ fontWeight: 600, color: 'var(--mv-text)', marginBottom: '0.5rem', fontSize: '1.125rem' }}>Property Interest</div>
                {lead.propertyId ? (
                  <Suspense fallback={<div>Loading property details...</div>}>
                    <PropertyContextFetcher propertyId={lead.propertyId} />
                  </Suspense>
                ) : (
                  <div>No property ID provided.</div>
                )}
              </>
            )}

            {/* SERVICE CONTACT */}
            {lead.source === 'SERVICE_CONTACT' && (
              <>
                <div style={{ fontWeight: 600, color: 'var(--mv-text)', marginBottom: '0.5rem', fontSize: '1.125rem' }}>Allied Service Inquiry</div>
                {lead.serviceId ? (
                  <Suspense fallback={<div>Loading service details...</div>}>
                    <ServiceContextFetcher serviceId={lead.serviceId} />
                  </Suspense>
                ) : (
                  <div>No service ID provided.</div>
                )}
              </>
            )}

            {/* CONSULTATION */}
            {lead.source === 'CONSULTATION' && (
              <>
                <div style={{ fontWeight: 600, color: 'var(--mv-text)', marginBottom: '0.5rem', fontSize: '1.125rem' }}>General Consultation</div>
                <div style={{ fontSize: '0.875rem' }}>
                  This lead requested a general property consultation. Check if they provided any extra information in their message or metadata.
                  {lead.metadata && Object.keys(lead.metadata as object).length > 0 && (
                    <div style={{ background: 'var(--mv-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--mv-border)', marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                      {Object.entries(lead.metadata as Record<string, any>).map(([key, value]) => {
                        if (key === 'consultationId' || !value) return null;
                        
                        // Format key (e.g. 'wantedPropertyType' -> 'Wanted Property Type')
                        const formattedKey = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase());

                        return (
                          <div key={key}>
                            <div style={{ color: 'var(--mv-text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                              {formattedKey}
                            </div>
                            <div style={{ color: 'var(--mv-text)', fontWeight: 500, fontSize: '0.875rem' }}>
                              {String(value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* REGISTRATION */}
            {lead.source === 'REGISTRATION' && (
              <>
                <div style={{ fontWeight: 600, color: 'var(--mv-text)', marginBottom: '0.5rem', fontSize: '1.125rem' }}>Platform Registration</div>
                <div style={{ fontSize: '0.875rem' }}>
                  This lead was created automatically when the user registered an account on the platform.
                </div>
              </>
            )}
            
          </div>
        </div>

        {/* Lead Management Client Component (Status & Notes) */}
        <LeadDetailsClient 
          leadId={lead.id} 
          initialStatus={lead.status} 
          initialNotes={lead.notes} 
        />

      </div>
    </div>
  );
}

async function PropertyContextFetcher({ propertyId }: { propertyId: string }) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) return <div style={{ color: '#ef4444' }}>Property not found or deleted (ID: {propertyId})</div>;

  return (
    <div style={{ background: 'var(--mv-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--mv-border)', marginTop: '1rem' }}>
      <div style={{ fontWeight: 600, color: 'var(--mv-text)', fontSize: '1rem', marginBottom: '0.25rem' }}>{property.title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem', marginTop: '0.75rem' }}>
        <div>
          <span style={{ color: 'var(--mv-text-secondary)' }}>Price:</span>{' '}
          <span style={{ fontWeight: 500, color: 'var(--mv-text)' }}>
            {property.priceType === 'ON_REQUEST' ? 'Price on Request' : property.price ? `₹${property.price.toLocaleString('en-IN')}` : 'N/A'}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--mv-text-secondary)' }}>Location:</span>{' '}
          <span style={{ fontWeight: 500, color: 'var(--mv-text)' }}>{property.approximateLocation || 'Not specified'}</span>
        </div>
        <div>
          <span style={{ color: 'var(--mv-text-secondary)' }}>Status:</span>{' '}
          <span className="mv-badge">{property.status}</span>
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <Link href={`/admin/properties/${property.slug}`} style={{ fontSize: '0.875rem', color: 'var(--mv-accent)', textDecoration: 'none', fontWeight: 500 }}>
          View Property →
        </Link>
      </div>
    </div>
  );
}

async function ServiceContextFetcher({ serviceId }: { serviceId: string }) {
  const service = await prisma.alliedService.findUnique({
    where: { id: serviceId },
  });

  if (!service) return <div style={{ color: '#ef4444' }}>Service not found or deleted (ID: {serviceId})</div>;

  return (
    <div style={{ background: 'var(--mv-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--mv-border)', marginTop: '1rem' }}>
      <div style={{ fontWeight: 600, color: 'var(--mv-text)', fontSize: '1rem', marginBottom: '0.25rem' }}>{service.name}</div>
      {service.description && (
        <div style={{ fontSize: '0.875rem', color: 'var(--mv-text-secondary)', marginTop: '0.5rem' }}>{service.description}</div>
      )}
      <div style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--mv-text-secondary)' }}>WhatsApp:</span> <span style={{ fontWeight: 500, color: 'var(--mv-text)' }}>{service.whatsappNumber}</span>
      </div>
    </div>
  );
}
