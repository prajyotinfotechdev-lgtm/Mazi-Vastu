import { prisma } from '@/lib/db/prisma';
import ServiceCard from './ServiceCard';
import { getVisitorSession } from '@/lib/auth/middleware';
import { getLanguage } from '@/lib/i18n/get-language';
import { t } from '@/lib/i18n/translate';

export const metadata = {
  title: 'Concierge Services | MaziVastu',
  description: 'Explore our concierge services including Loans, Interior Design, Contractors, and more.',
};

export default async function PublicServicesPage() {
  const lang = getLanguage();
  const visitor = await getVisitorSession();

  const services = await prisma.alliedService.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <main style={{ background: '#0a0a0c', minHeight: '100vh', paddingBottom: '6rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Dynamic Ambient Background */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(245, 197, 24, 0.08) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none', animation: 'float 20s infinite alternate' }} />
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(20, 30, 60, 0.4) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none', animation: 'float 25s infinite alternate-reverse' }} />

      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 50px) scale(1.1); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-title {
          font-family: Outfit, sans-serif;
          font-size: clamp(1.6rem, 7vw, 4rem);
          font-weight: 800;
          background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .hero-subtitle {
          font-size: clamp(0.85rem, 4vw, 1.125rem);
          color: #a1a1aa;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.5;
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.15s forwards;
          padding: 0 1rem;
        }

        .mv-inner-header-bg {
          padding-top: 6rem;
          padding-bottom: 2rem;
          position: relative;
          z-index: 1;
        }
        
        @media (min-width: 640px) {
          .mv-inner-header-bg {
            padding-top: calc(var(--mv-space-4xl) + 80px);
            padding-bottom: 4rem;
          }
        }
        
        .ultra-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
          position: relative;
          z-index: 1;
        }
        
        @media (max-width: 639px) {
          .ultra-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }
        
        .stagger-item {
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>

      {/* Hero Header Banner */}
      <div className="mv-inner-header-bg">
        <div className="mv-container" style={{ textAlign: 'center' }}>
          <h1 className="hero-title">
            {t('services.title', lang)}
          </h1>
          <p className="hero-subtitle">
            {t('services.subtitle', lang)}
          </p>
        </div>
      </div>

      <div className="mv-container">
        {services.length === 0 ? (
          <div className="mv-empty-state" style={{ animation: 'fadeInUp 0.8s ease forwards' }}>
            <h3 className="mv-heading-sm" style={{ color: 'var(--mv-text-secondary)' }}>{t('services.comingSoon', lang)}</h3>
          </div>
        ) : (
          <div className="ultra-grid">
            {services.map((service, idx) => (
              <div key={service.id} className="stagger-item" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                <ServiceCard service={service} isRegistered={!!visitor} lang={lang} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
