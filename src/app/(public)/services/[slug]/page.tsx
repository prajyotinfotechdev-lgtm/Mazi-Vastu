import { prisma } from '@/lib/db/prisma';
import { notFound } from 'next/navigation';
import ServiceInquiryForm from '@/components/public/ServiceInquiryForm';
import AdBanner from '@/components/public/AdBanner';
import { Wrench, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getLanguage } from '@/lib/i18n/get-language';
import { t } from '@/lib/i18n/translate';

export default async function ServiceDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const lang = getLanguage();

  const service = await prisma.alliedService.findUnique({
    where: { slug: params.slug, deletedAt: null },
  });

  if (!service) {
    notFound();
  }

  // Fetch the service page advertisement
  const serviceAd = await prisma.advertisement.findFirst({
    where: { 
      status: 'ACTIVE', 
      deletedAt: null,
      placements: {
        some: { placementZone: 'SERVICE_PAGE_SLOT' }
      }
    },
    orderBy: { createdAt: 'desc' },
    include: { media: { take: 1 } }
  });

  const whatsappMessage = encodeURIComponent(
    service.whatsappMessageTemplate.replace('{serviceName}', service.name)
  );
  const whatsappUrl = `https://wa.me/${service.whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mv-bg)', padding: 'var(--mv-space-4xl) 0' }}>
      <div className="mv-container">
        
        <Link href="/services" className="mv-btn mv-btn-ghost" style={{ padding: '0.5rem 0', display: 'inline-flex', marginBottom: 'var(--mv-space-2xl)' }}>
          <ArrowLeft size={18} /> {t('services.backToAll', lang)}
        </Link>

        {serviceAd && (
          <div style={{ marginBottom: 'var(--mv-space-3xl)' }}>
            <AdBanner ad={serviceAd} layout="premium" />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--mv-space-3xl)', '@media (min-width: 1024px)': { gridTemplateColumns: '1fr 400px' } } as React.CSSProperties}>
          
          {/* Main Content */}
          <div className="mv-card" style={{ padding: 'var(--mv-space-3xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--mv-space-xl)', marginBottom: 'var(--mv-space-2xl)' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: 'var(--mv-radius-xl)',
                background: 'var(--mv-bg-surface)', border: '1px solid var(--mv-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {service.iconUrl ? (
                  <img src={service.iconUrl} alt={service.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                ) : (
                  <Wrench size={40} color="var(--mv-accent)" />
                )}
              </div>
              <div>
                <h1 className="mv-heading-xl" style={{ color: 'var(--mv-text)', margin: 0 }}>
                  {service.name}
                </h1>
                {service.price && (
                  <div style={{ fontSize: '1.25rem', color: 'var(--mv-accent)', fontWeight: 700, marginTop: '0.5rem' }}>
                    {t('services.startsAt', lang)} ₹{service.price.toLocaleString('en-IN')} {service.priceUnit ? `/ ${service.priceUnit}` : ''}
                  </div>
                )}
              </div>
            </div>

            <div className="mv-body" style={{ color: 'var(--mv-text-secondary)', lineHeight: 1.8 }}>
              {service.description ? (
                service.description.split('\n').map((paragraph, index) => (
                  <p key={index} style={{ marginBottom: '1.5rem' }}>
                    {paragraph}
                  </p>
                ))
              ) : (
                <p>{t('services.defaultDescription', lang)}</p>
              )}
            </div>

            <div style={{ marginTop: 'var(--mv-space-3xl)', paddingTop: 'var(--mv-space-3xl)', borderTop: '1px solid var(--mv-border)', display: 'flex', justifyContent: 'center' }}>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mv-btn mv-btn-whatsapp mv-btn-lg"
              >
                <Phone size={20} />
                {t('services.contactWhatsApp', lang)}
              </a>
            </div>
          </div>

          {/* Sticky Sidebar / Lead Gen */}
          <div style={{ position: 'sticky', top: 'var(--mv-space-2xl)' }}>
            <ServiceInquiryForm serviceId={service.id} serviceName={service.name} />
          </div>

        </div>
      </div>
    </div>
  );
}
