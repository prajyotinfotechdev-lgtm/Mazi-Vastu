import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import MobileBottomNav from '@/components/public/MobileBottomNav';
import AdBanner from '@/components/public/AdBanner';
import VisitorPushOptIn from '@/components/public/VisitorPushOptIn';
import { prisma } from '@/lib/db/prisma';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = (await import('@/lib/i18n/get-language')).getLanguage();
  const footerAd = await prisma.advertisement.findFirst({
    where: { 
      status: 'ACTIVE', 
      deletedAt: null,
      placements: {
        some: { placementZone: 'FOOTER_STRIP' }
      }
    },
    orderBy: { createdAt: 'desc' },
    include: { media: { take: 1 } }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--mv-bg)' }}>
      <Navbar lang={lang} />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      
      {footerAd && (
        <div className="mv-container" style={{ marginTop: '3rem', marginBottom: '2rem' }}>
          <AdBanner ad={footerAd} layout="premium" />
        </div>
      )}
      
      <Footer />
      <MobileBottomNav lang={lang} />
      <div className="mv-bottom-spacer" />
      <VisitorPushOptIn />
    </div>
  );
}
