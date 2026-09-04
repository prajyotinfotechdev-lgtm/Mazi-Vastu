import { prisma } from '@/lib/db/prisma';
import PropertyCard from '@/components/public/PropertyCard';
import PremiumPropertyCarousel from '@/components/public/PremiumPropertyCarousel';
import AdBanner from '@/components/public/AdBanner';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle2, Home, Map, Building, Building2, Store, Mountain, Key, Info, Truck, Scale, Compass, Hammer, Sparkles, Paintbrush, Briefcase, Landmark, MapPin } from 'lucide-react';
import logoImg from '@/assets/Logo.jpeg';
import { cookies } from 'next/headers';
import { getLanguage } from '@/lib/i18n/get-language';
import { t } from '@/lib/i18n/translate';
import { staticArticles } from '@/lib/blog/articles';
import { LATUR_CITIES } from '@/lib/seo/latur-cities';

import CategoryGrid from '@/components/public/CategoryGrid';

// ISR disabled since cookies() are used in the RootLayout
// export const revalidate = 300;

export const metadata: Metadata = {
  title: 'MaziVastu | Property in Latur | Buy Sell Rent घर प्लॉट फ्लॅट',
  description:
    'MaziVastu — Latur district\'s #1 property portal. Buy, sell or rent homes, plots, flats & shops in Latur, Udgir, Nilanga, Ausa, Ahmedpur, Chakur, Deoni, Renapur, Jalkot & Shirur Anantpal. लातूर जिल्ह्यातील सर्वोत्तम मालमत्ता पोर्टल.',
  keywords: [
    'property in latur', 'latur property', 'latur real estate',
    'ghar vikne ahe latur', 'plot for sale latur', 'flat in latur',
    'latur madhe ghar', 'latur jilha property', 'udgir property',
    'nilanga property', 'ausa property', 'ahmedpur property', 'chakur property',
    'buy home latur maharashtra', 'latur mein makaan', 'MaziVastu', 'माझी वास्तु',
  ],
  alternates: { canonical: 'https://mazivastu.com' },
  openGraph: {
    title: 'MaziVastu | #1 Property Portal — Latur District, Maharashtra',
    description: 'Find verified properties in Latur, Udgir, Nilanga, Ausa and all talukas of Latur district.',
    url: 'https://mazivastu.com',
    type: 'website',
    siteName: 'MaziVastu',
  },
};

const getServiceIcon = (name: string, size: number = 40) => {
  const lower = name.toLowerCase();
  if (lower.includes('loan') || lower.includes('finance')) return <Landmark size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('interior') || lower.includes('design')) return <Paintbrush size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('pack') || lower.includes('move')) return <Truck size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('legal') || lower.includes('law') || lower.includes('doc')) return <Scale size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('vastu')) return <Compass size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('clean')) return <Sparkles size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  if (lower.includes('construct') || lower.includes('renovat') || lower.includes('repair') || lower.includes('plumb')) return <Hammer size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
  return <Briefcase size={size} strokeWidth={1.5} color="var(--mv-accent)" />;
};

import { Search as SearchIcon } from 'lucide-react';
import SearchIconCustom from '@/components/icons/SearchIcon';
import React from 'react';
import FilterModal from '@/components/public/FilterModal';
import PremiumSearchBar from '@/components/public/PremiumSearchBar';
import CustomCategorySelect from '@/components/public/CustomCategorySelect';
import AdvancedSearchBar from '@/components/public/AdvancedSearchBar';

export default async function HomePage({ searchParams }: { searchParams?: { q?: string; type?: string } }) {
  const lang = getLanguage();
  const query = searchParams?.q || '';
  const typeFilter = searchParams?.type || '';

  const searchWhere: any = { status: 'PUBLISHED', deletedAt: null };
  if (query) {
    searchWhere.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { approximateLocation: { contains: query, mode: 'insensitive' } },
    ];
  }
  if (typeFilter) {
    searchWhere.propertyTypeId = typeFilter;
  }

  const [
    properties,
    searchedPropertiesRaw,
    services,
    propertyTypes,
    propertiesCount,
    servicesCount,
    ad,
    uniqueLocationsData
  ] = await Promise.all([
    prisma.property.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { media: { orderBy: { sortOrder: 'asc' }, take: 1 }, propertyType: true }
    }),
    prisma.property.findMany({
      where: searchWhere,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { media: { orderBy: { sortOrder: 'asc' }, take: 1 }, propertyType: true }
    }),
    prisma.alliedService.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' }, take: 8
    }),
    prisma.propertyType.findMany({ where: { deletedAt: null, isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.property.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
    prisma.alliedService.count({ where: { isActive: true, deletedAt: null } }),
    prisma.advertisement.findFirst({
      where: { status: 'ACTIVE', deletedAt: null, placements: { some: { placementZone: 'HOMEPAGE_BANNER' } } },
      orderBy: { createdAt: 'desc' }, include: { media: { take: 1 } }
    }),
    prisma.property.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      select: { approximateLocation: true },
      distinct: ['approximateLocation']
    })
  ]);

  const rawLocations = uniqueLocationsData.map((l: any) => l.approximateLocation?.trim()).filter(Boolean) as string[];
  const uniqueLocations = Array.from(new Set(rawLocations.map(loc => loc.toLowerCase()))).map(lowerLoc => rawLocations.find(loc => loc.toLowerCase() === lowerLoc) || '');
  const searchedProperties = searchedPropertiesRaw || [];

  const cookieStore = cookies();
  const visitorCookie = cookieStore.get('visitor_info');
  const isLocked = !visitorCookie;

  const safeProperties = properties.map(p => ({
    ...p, price: isLocked ? 0 : p.price, priceType: isLocked ? 'HIDDEN' : p.priceType,
    approximateLocation: isLocked ? 'Location hidden' : p.approximateLocation, size: isLocked ? 0 : p.size,
  }));

  const safeSearchedProperties = searchedProperties.map((p: any) => ({
    ...p, price: isLocked ? 0 : p.price, priceType: isLocked ? 'HIDDEN' : p.priceType,
    approximateLocation: isLocked ? 'Location hidden' : p.approximateLocation, size: isLocked ? 0 : p.size,
  })) || [];

  const clientsCount = 1250 + (propertiesCount * 3);

  return (
    <div style={{ background: 'var(--mv-bg)', width: '100%', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .mv-category-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }
        .mv-category-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--mv-accent, #f5c518), #d49a00);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 14px;
          color: #000000;
          text-decoration: none;
          padding: 8px 4px;
          min-width: 60px;
          flex: 1 1 auto;
          max-width: calc(25% - 6px);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-align: center;
          font-weight: 700;
          box-shadow: 0 6px 16px rgba(245, 197, 24, 0.15), inset 0 2px 2px rgba(255, 255, 255, 0.4);
        }
        .mv-category-card:hover {
          transform: translateY(-5px) scale(1.03);
          background: linear-gradient(135deg, #ffd700, #f5c518);
          border-color: rgba(255, 255, 255, 0.6);
          box-shadow: 0 15px 30px -10px rgba(245, 197, 24, 0.5), 0 0 20px rgba(245, 197, 24, 0.3), inset 0 2px 3px rgba(255, 255, 255, 0.6);
        }
        .mv-category-icon {
          color: #000000;
          margin-bottom: 6px;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
        }
        .mv-category-card:hover .mv-category-icon {
          transform: scale(1.1);
        }
        .mv-category-icon svg {
          width: 18px;
          height: 18px;
        }
        .mv-category-title {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          font-family: Outfit, sans-serif;
          line-height: 1.25;
          color: #000000;
          word-break: break-word;
          overflow-wrap: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .mv-categories-section {
          padding: 24px var(--mv-space-md) 24px;
        }
        @media (max-width: 480px) {
          .mv-categories-section {
            padding-left: 15px;
            padding-right: 15px;
          }
          .mv-category-card {
            max-width: calc(25% - 6px);
          }
          /* Card 1 (Far Left): Align left edge */
          .mv-category-card:nth-child(4n+1) .mv-subcategory-dropdown {
            left: 0 !important;
            right: auto !important;
            transform: none !important;
          }
          /* Card 2 (Middle Left): Shift left slightly */
          .mv-category-card:nth-child(4n+2) .mv-subcategory-dropdown {
            left: -50% !important;
            right: auto !important;
            transform: none !important;
          }
          /* Card 3 (Middle Right): Shift right slightly */
          .mv-category-card:nth-child(4n+3) .mv-subcategory-dropdown {
            left: auto !important;
            right: -50% !important;
            transform: none !important;
          }
          /* Card 4 (Far Right): Align right edge */
          .mv-category-card:nth-child(4n+4) .mv-subcategory-dropdown {
            left: auto !important;
            right: 0 !important;
            transform: none !important;
          }
        }

        @media (min-width: 640px) {
          .mv-category-grid {
            gap: 12px;
          }
          .mv-category-card {
            max-width: calc(25% - 9px);
            padding: 16px 12px;
            min-width: 110px;
            border-radius: 16px;
          }
          .mv-category-icon {
            margin-bottom: 8px;
          }
          .mv-category-icon svg {
            width: 22px;
            height: 22px;
          }
          .mv-category-title {
            font-size: 0.8125rem;
          }
        }

        @media (min-width: 1024px) {
          .mv-category-card {
            max-width: 140px;
            padding: 20px 12px;
          }
        }
        .mv-hero-bg-wrapper {
          background: url(/images/mobile-hero-bg.svg) center top no-repeat var(--mv-bg);
          background-size: cover;
          position: relative;
          width: 100%;
          margin-top: -60px;
          padding-top: 60px;
        }
        .mv-hero-branding {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem var(--mv-space-md) 1rem;
          background: transparent;
        }
        @media (min-width: 768px) {
          .mv-hero-bg-wrapper {
            background: url(/images/hero-bg.svg) center top no-repeat var(--mv-bg);
            background-size: cover;
            margin-top: -80px;
            padding-top: 80px;
          }
        }
        
        /* Premium Services Grid */
        .mv-premium-service-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding-top: 16px;
          padding-bottom: 16px;
        }
        @media (min-width: 640px) {
          .mv-premium-service-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
        }
        @media (min-width: 1024px) {
          .mv-premium-service-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
        }

        .mv-premium-service-card {
          background: linear-gradient(145deg, rgba(20,20,20,0.95), rgba(10,10,10,0.95));
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          transition: all 300ms cubic-bezier(0.25, 1, 0.5, 1);
          position: relative;
          overflow: hidden;
        }
        .mv-premium-service-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at center, rgba(245, 197, 24, 0.08) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 300ms ease;
          pointer-events: none;
          z-index: 2;
        }
        .mv-premium-service-card:hover {
          transform: translateY(-4px);
          border-color: rgba(245, 197, 24, 0.3);
          box-shadow: 0 12px 24px -10px rgba(0,0,0,0.8), 0 0 15px -5px rgba(245, 197, 24, 0.15);
        }
        .mv-premium-service-card:hover::before {
          opacity: 1;
        }
        
        .mv-premium-service-image-box {
          height: 120px;
          width: 100%;
          background: linear-gradient(135deg, rgba(245, 197, 24, 0.1), rgba(0,0,0,0.4));
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .mv-premium-service-image-box img.svc-cover {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 500ms ease;
        }
        .mv-premium-service-card:hover .mv-premium-service-image-box img.svc-cover {
          transform: scale(1.05);
        }
        
        /* Fallback icon wrapper if no image */
        .mv-premium-service-fallback-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(20,20,20,0.8);
          border: 1px solid rgba(245, 197, 24, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--mv-accent);
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          transition: transform 300ms ease;
        }
        .mv-premium-service-card:hover .mv-premium-service-fallback-icon {
          transform: scale(1.1);
        }

        .mv-premium-service-content {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        
        .mv-premium-service-title {
          font-family: Outfit, sans-serif;
          color: var(--mv-text);
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 6px;
          line-height: 1.2;
        }
        .mv-premium-service-price {
          color: var(--mv-accent);
          font-size: 0.8125rem;
          font-weight: 600;
          margin: 0;
          margin-top: auto;
        }
        
        @media (min-width: 768px) {
          .mv-premium-service-image-box {
            height: 140px;
          }
          .mv-premium-service-content {
            padding: 20px;
          }
          .mv-premium-service-fallback-icon {
            width: 64px;
            height: 64px;
          }
          .mv-premium-service-title {
            font-size: 1.125rem;
          }
          .mv-premium-service-price {
            font-size: 0.875rem;
          }
        }

        /* Blog Card Hover Effects */
        .mv-blog-card {
          display: flex;
          flex-direction: column;
          transition: all 300ms cubic-bezier(0.25, 1, 0.5, 1);
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }
        .mv-blog-card:hover {
          transform: translateY(-4px);
          border-color: rgba(245, 197, 24, 0.3);
          box-shadow: 0 12px 24px -10px rgba(0,0,0,0.8), 0 0 15px -5px rgba(245, 197, 24, 0.15);
        }
        .mv-blog-image-box {
          width: 100%;
          height: 200px;
          border-bottom: 1px solid var(--mv-border);
          overflow: hidden;
        }
        .mv-blog-image-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 500ms ease;
        }
        .mv-blog-card:hover .mv-blog-image-box img {
          transform: scale(1.05);
        }
      `}} />

      {/* HERO & CATEGORIES WRAPPER FOR BACKGROUND */}
      <div className="mv-hero-bg-wrapper">
        {/* 0. HERO BRANDING */}
        <section className="mv-hero-branding">
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}>
            <Image
              src={logoImg}
              alt="MaziVastu Logo"
              width={72}
              height={72}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              priority
            />
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'var(--mv-text)',
            letterSpacing: '-0.02em',
            fontFamily: 'Outfit, sans-serif',
            margin: '0 0 0.5rem 0',
            textAlign: 'center'
          }}>
            {lang === 'mr' ? 'माझी' : 'Mazi'}<span style={{ color: 'var(--mv-accent)' }}>{lang === 'mr' ? 'वास्तु' : 'Vastu'}</span>
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--mv-text-secondary)',
            textAlign: 'center',
            maxWidth: '400px',
            margin: 0
          }}>
            {lang === 'mr' ? 'आपले घर, आपले स्वप्न' : 'Your home, your dream'}
          </p>
        </section>


        {/* 1. PROPERTY CATEGORIES */}
        <section className="mv-categories-section" style={{
          position: 'relative',
          width: '100%',
          background: 'transparent',
          zIndex: 40,
        }}>
          <CategoryGrid propertyTypes={propertyTypes} lang={lang} />
        </section>
      </div>

      {/* Search Bar (Moved above Latest Property Uploads) */}
      <section style={{ padding: '4rem 16px 0 16px', marginBottom: 'var(--mv-space-xl)' }}>
        <AdvancedSearchBar
          propertyTypes={propertyTypes as any}
          uniqueLocations={uniqueLocations}
          lang={lang}
          initialQuery={query}
          initialType={typeFilter}
        />
      </section>

      {/* 3. LATEST PROPERTY UPLOADS (POP-UP CAROUSEL) */}
      <section style={{ background: 'transparent', padding: 'var(--mv-space-2xl) 0' }}>
        <PremiumPropertyCarousel
          properties={safeProperties.slice(0, 4) as any}
          isLocked={isLocked}
          lang={lang}
          title="Latest Property uploads"
          viewAllText={t('home.viewAll', lang)}
          viewAllLink="/properties"
        />
      </section>

      {/* Featured Ad Banner */}
      {ad && (
        <section className="mv-container" style={{ paddingBottom: 'var(--mv-space-3xl)', paddingTop: 'var(--mv-space-xl)' }}>
          <AdBanner ad={ad} layout="premium" />
        </section>
      )}



      {/* PROPERTY LISTINGS */}
      <section className="mv-container" style={{ paddingBottom: 'var(--mv-space-4xl)' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {safeSearchedProperties.length > 0 ? (
            safeSearchedProperties.map((prop: any) => (
              <PropertyCard key={prop.id} property={prop} isLocked={isLocked} lang={lang} variant="horizontal" />
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'linear-gradient(145deg, rgba(20,20,20,0.6), rgba(10,10,10,0.6))',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(245, 197, 24, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mv-accent)'
              }}>
                <SearchIcon size={32} strokeWidth={1.5} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif', color: 'var(--mv-text)', margin: 0 }}>No Properties Found</h3>
              <p style={{ color: 'var(--mv-text-secondary)', margin: 0, maxWidth: '300px' }}>
                We couldn't find any exact matches. Try adjusting your search or filters to see more results.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. OUR SERVICES */}
      <section className="mv-container mv-section">
        <div className="mv-section-header">
          <div>
            <div className="mv-section-label">{t('home.beyondListings', lang)}</div>
            <h2 className="mv-heading-lg" style={{ color: 'var(--mv-text)' }}>
              {t('home.beyondListingsSubtitle', lang)}
            </h2>
          </div>
          <Link href="/services" className="mv-btn mv-btn-secondary">
            {t('home.exploreServices', lang)}
          </Link>
        </div>

        <div className="mv-premium-service-grid">
          {services.map(service => (
            <Link key={service.id} href={`/services/${service.slug || ''}`} className="mv-premium-service-card">

              <div className="mv-premium-service-image-box">
                {service.iconUrl ? (
                  /* If it's a real photo, cover the box. If it's just a small icon, it might look odd, 
                     but we treat iconUrl as the photo URL now. */
                  <img src={service.iconUrl} alt={service.name} className="svc-cover" />
                ) : (
                  <div className="mv-premium-service-fallback-icon">
                    {getServiceIcon(service.name, 28)}
                  </div>
                )}
              </div>

              <div className="mv-premium-service-content">
                <h3 className="mv-premium-service-title line-clamp-2">{service.name}</h3>
                <p className="mv-premium-service-price line-clamp-1">
                  {service.price ? `Starts at ₹${service.price.toLocaleString('en-IN')}` : 'Custom Pricing'}
                </p>
              </div>

            </Link>
          ))}
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <section className="mv-section" style={{ paddingTop: 0 }}>
        <div className="mv-container">
          <div style={{
            position: 'relative',
            padding: 'var(--mv-space-5xl) var(--mv-space-2xl)',
            borderRadius: 'var(--mv-radius-2xl)',
            backgroundImage: 'linear-gradient(rgba(10, 10, 10, 0.7), rgba(10, 10, 10, 0.9)), url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            textAlign: 'center',
            border: '1px solid var(--mv-border)',
            boxShadow: 'var(--mv-shadow-glow)'
          }}>
            <h2 className="mv-heading-xl" style={{ color: 'var(--mv-text)', marginBottom: 'var(--mv-space-xl)' }}>
              {t('home.ctaBanner', lang)}
            </h2>
            <Link href="/contact" className="mv-btn mv-btn-primary mv-btn-lg">
              {t('home.consultNow', lang)} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. BLOG & ARTICLES */}
      <section className="mv-container mv-section" style={{ paddingTop: 0 }}>
        <div className="mv-section-header">
          <div>
            <div className="mv-section-label">Read Our</div>
            <h2 className="mv-heading-lg" style={{ color: 'var(--mv-text)' }}>
              {t('home.blogTitle', lang)}
            </h2>
          </div>
          <Link href="#" className="mv-btn mv-btn-secondary">
            {t('home.viewAll', lang)}
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--mv-space-xl)' }}>
          {staticArticles.map((article) => {
            return (
              <Link href={`/blog/${article.slug}`} key={article.slug} className="mv-card mv-blog-card">
                <div className="mv-blog-image-box">
                  <img src={article.image} alt={t(`blog.${article.slug}.title`, lang)} />
                </div>
                <div style={{ padding: 'var(--mv-space-lg)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: 'var(--mv-accent)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{article.date}</div>
                  <h3 className="mv-heading-sm line-clamp-2" style={{ color: 'var(--mv-text)', marginBottom: '0.5rem' }}>
                    {t(`blog.${article.slug}.title`, lang)}
                  </h3>
                  <p className="mv-body-sm line-clamp-2" style={{ color: 'var(--mv-text-secondary)', margin: 0 }}>
                    {t(`blog.${article.slug}.excerpt`, lang)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* LATUR DISTRICT CITIES — SEO SECTION */}
      <section className="mv-container" style={{ paddingBottom: 'var(--mv-space-4xl)', paddingTop: 0 }}>
        <style dangerouslySetInnerHTML={{
          __html: `
          .latur-city-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          @media (min-width: 640px) { .latur-city-grid { grid-template-columns: repeat(3, 1fr); } }
          @media (min-width: 1024px) { .latur-city-grid { grid-template-columns: repeat(5, 1fr); } }
          .latur-city-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 16px 12px;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 14px;
            background: rgba(255,255,255,0.02);
            text-decoration: none;
            color: var(--mv-text);
            font-weight: 600;
            font-size: 0.9rem;
            text-align: center;
            transition: all 0.25s ease;
          }
          .latur-city-link:hover {
            border-color: rgba(245,197,24,0.35);
            background: rgba(245,197,24,0.05);
            color: var(--mv-accent);
            transform: translateY(-2px);
          }
          .latur-city-link .city-subtext {
            font-size: 0.7rem;
            color: var(--mv-text-muted);
            font-weight: 400;
          }
        `}} />
        <div className="mv-section-header">
          <div>
            <div className="mv-section-label">{lang === 'mr' ? 'लातूर जिल्हा' : 'Latur District'}</div>
            <h2 className="mv-heading-lg" style={{ color: 'var(--mv-text)' }}>
              {lang === 'mr' ? 'लातूर जिल्ह्यातील सर्व शहरे' : 'Property in Every City of Latur District'}
            </h2>
          </div>
        </div>
        <div className="latur-city-grid">
          {LATUR_CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/properties/latur/${city.slug}`}
              className="latur-city-link"
            >
              <MapPin size={18} color="var(--mv-accent)" />
              <span>{lang === 'mr' ? city.marathiName : city.name}</span>
              <span className="city-subtext">
                {lang === 'mr' ? 'मालमत्ता पहा' : 'View Property'}
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}


