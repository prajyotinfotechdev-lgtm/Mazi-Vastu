import React from 'react';
import { prisma } from '@/lib/db/prisma';
import PropertyCard from '@/components/public/PropertyCard';
import AdBanner from '@/components/public/AdBanner';
import { Filter, Search, Home, Map, Building, Building2, Store, Mountain, Key, Info, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getLanguage } from '@/lib/i18n/get-language';
import { getDictionary } from '@/lib/i18n/translate';
import CustomCategorySelect from '@/components/public/CustomCategorySelect';
import AdvancedSearchBar from '@/components/public/AdvancedSearchBar';
import { t } from '@/lib/i18n/translate';

// ISR: revalidate every 2 minutes for real-time-ish listings
export const revalidate = 120;

const getCategoryIcon = (name: string, iconSize: number = 28) => {
  const lower = name.toLowerCase();
  if (lower.includes('home')) return <Home size={iconSize} strokeWidth={1.5} />;
  if (lower.includes('plot')) return <Map size={iconSize} strokeWidth={1.5} />;
  if (lower.includes('row')) return <Building size={iconSize} strokeWidth={1.5} />;
  if (lower.includes('flat') || lower.includes('apartment')) return <Building2 size={iconSize} strokeWidth={1.5} />;
  if (lower.includes('shop') || lower.includes('commercial')) return <Store size={iconSize} strokeWidth={1.5} />;
  if (lower.includes('land')) return <Mountain size={iconSize} strokeWidth={1.5} />;
  if (lower.includes('rent')) return <Key size={iconSize} strokeWidth={1.5} />;
  return <Info size={iconSize} strokeWidth={1.5} />;
};

export default async function PropertiesSearchPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; location?: string; minPrice?: string; maxPrice?: string };
}) {
  const lang = getLanguage();
  const query = searchParams.q || '';
  const typeFilter = searchParams.type || '';
  const location = searchParams.location || '';
  const minPrice = searchParams.minPrice || '';
  const maxPrice = searchParams.maxPrice || '';

  const types = await prisma.propertyType.findMany({
    where: { deletedAt: null, isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  const locationsQuery = await prisma.property.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    select: { approximateLocation: true },
    distinct: ['approximateLocation']
  });
  const rawLocations = locationsQuery.map(l => l.approximateLocation?.trim()).filter(Boolean) as string[];
  const uniqueLocations = Array.from(new Set(rawLocations.map(loc => loc.toLowerCase()))).map(lowerLoc => rawLocations.find(loc => loc.toLowerCase() === lowerLoc) || '');

  const whereFilter: any = {
    status: 'PUBLISHED',
    deletedAt: null,
  };

  if (query) {
    whereFilter.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { approximateLocation: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (typeFilter) {
    whereFilter.propertyTypeId = typeFilter;
  }

  if (location) {
    whereFilter.approximateLocation = { equals: location, mode: 'insensitive' };
  }
  
  if (minPrice || maxPrice) {
    whereFilter.price = {};
    if (minPrice) whereFilter.price.gte = parseFloat(minPrice);
    if (maxPrice) whereFilter.price.lte = parseFloat(maxPrice);
  }

  const properties = await prisma.property.findMany({
    where: whereFilter,
    orderBy: { createdAt: 'desc' },
    include: {
      propertyType: true,
      media: { orderBy: { sortOrder: 'asc' }, take: 1 }
    }
  });

  const categoryAds = await prisma.advertisement.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      placements: { some: { placementZone: 'CATEGORY_PAGE_SLOT' } }
    },
    orderBy: { createdAt: 'desc' },
    include: { media: { take: 1 } }
  });

  const cookieStore = cookies();
  const visitorCookie = cookieStore.get('visitor_info');
  const isLocked = !visitorCookie;

  const safeProperties = properties.map(p => ({
    ...p,
    price: isLocked ? 0 : p.price,
    priceType: isLocked ? 'HIDDEN' : p.priceType,
    approximateLocation: isLocked ? 'Location hidden' : p.approximateLocation,
    size: isLocked ? 0 : p.size,
  }));

  return (
    <div style={{ background: 'var(--mv-bg)', minHeight: '100vh', paddingBottom: 'var(--mv-space-4xl)' }}>
      <style>{`
        .mv-inner-header-bg {
          background: url(/images/page-hero-bg.svg) center top no-repeat transparent;
          background-size: cover;
          padding-top: calc(var(--mv-space-4xl) + 60px);
          padding-bottom: 3rem;
          margin-bottom: 2rem;
          margin-top: -60px;
        }
        @media (min-width: 768px) {
          .mv-inner-header-bg {
            padding-top: calc(var(--mv-space-4xl) + 80px);
            margin-top: -80px;
          }
        }
      `}</style>
      {/* Hero Header Banner */}
      <div className="mv-inner-header-bg">
        <div className="mv-container" style={{ textAlign: 'center' }}>
          <h1 className="mv-heading-xl" style={{ color: 'var(--mv-text)', marginBottom: 'var(--mv-space-sm)' }}>
            {t('properties.title', lang)}
          </h1>
          <p className="mv-body" style={{ color: 'var(--mv-text-secondary)' }}>
            {t('properties.showing', lang)} <span style={{ color: 'var(--mv-accent)', fontWeight: 700 }}>{properties.length}</span> {properties.length === 1 ? t('properties.property', lang) : t('properties.properties', lang)} {t('properties.availableNow', lang)}
          </p>
        </div>
      </div>

      <div className="mv-container">

        {/* Filters */}
        <div style={{ marginBottom: 'var(--mv-space-xl)' }}>
          <AdvancedSearchBar 
            propertyTypes={types as any} 
            uniqueLocations={uniqueLocations} 
            lang={lang} 
            initialQuery={query} 
            initialType={typeFilter}
            initialLocation={location}
            initialMinPrice={minPrice}
            initialMaxPrice={maxPrice}
          />
        </div>

        {/* Results */}
        {safeProperties.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            background: 'linear-gradient(145deg, rgba(20,20,20,0.6), rgba(10,10,10,0.6))', 
            borderRadius: '16px', 
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '2rem'
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
              <Search size={32} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif', color: 'var(--mv-text)', margin: 0 }}>
              {t('properties.noResults', lang) || 'No Properties Found'}
            </h3>
            <p style={{ color: 'var(--mv-text-secondary)', margin: 0, maxWidth: '300px' }}>
              {t('properties.noResultsHint', lang) || 'We couldn\'t find any exact matches. Try adjusting your search or filters to see more results.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {safeProperties.map((prop, index) => {
              const adIndex = Math.floor(index / 4);
              const shouldInjectAd = index % 4 === 3 && categoryAds[adIndex];

              return (
                <React.Fragment key={prop.id}>
                  <PropertyCard property={prop} isLocked={isLocked} lang={lang} variant="horizontal" />
                  {shouldInjectAd && (
                    <div style={{ width: '100%', margin: 'var(--mv-space-md) 0' }}>
                      <AdBanner ad={categoryAds[adIndex]} layout="premium" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
