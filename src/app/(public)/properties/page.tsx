import React from 'react';
import { prisma } from '@/lib/db/prisma';
import PropertyCard from '@/components/public/PropertyCard';
import AdBanner from '@/components/public/AdBanner';
import { Filter, Search, Home, Map, Building, Building2, Store, Mountain, Key, Info, Flame, MapPin, ArrowLeft } from 'lucide-react';
import Link from '@/components/ui/LoaderLink';
import { cookies } from 'next/headers';
import { getLanguage } from '@/lib/i18n/get-language';
import { getDictionary } from '@/lib/i18n/translate';
import CustomCategorySelect from '@/components/public/CustomCategorySelect';
import AdvancedSearchBar from '@/components/public/AdvancedSearchBar';
import { t } from '@/lib/i18n/translate';
import LocationCategoryPicker from '@/components/public/LocationCategoryPicker';

// ISR disabled since cookies() are used in the RootLayout
// export const revalidate = 120;

// The 4 special quick-location buttons on the home page
const SPECIAL_LOCATIONS = ['Ausa Road', 'Barshi Road', 'Ambejogai Road', 'Nanded Road'];

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
  searchParams: { q?: string; type?: string; location?: string; minPrice?: string; maxPrice?: string; category?: string };
}) {
  const lang = getLanguage();
  const query = searchParams.q || '';
  const typeFilter = searchParams.type || '';
  const location = searchParams.location || '';
  const minPrice = searchParams.minPrice || '';
  const maxPrice = searchParams.maxPrice || '';
  const category = (searchParams.category || '').toLowerCase(); // 'urgent' | 'rent' | ''

  // Check if user navigated via one of the 4 quick-location buttons
  const isSpecialLocation = !!location && SPECIAL_LOCATIONS.some(
    l => l.toLowerCase() === location.toLowerCase()
  );

  // ─── Step 1: No category selected → show two-option picker ───────────────────
  if (isSpecialLocation && !category) {
    return <LocationCategoryPicker location={location} lang={lang} />;
  }

  // ─── Step 2a: Urgent properties (from UrgentProperty table) ──────────────────
  if (isSpecialLocation && category === 'urgent') {
    const urgentItems = await prisma.urgentProperty.findMany({
      where: {
        isActive: true,
        location: { contains: location, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
    });

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
          .mv-urgent-text-card {
            background: linear-gradient(135deg, rgba(30,15,5,0.97), rgba(20,10,3,0.97));
            border: 1px solid rgba(251,146,60,0.2);
            border-radius: 14px;
            padding: 0.875rem 1rem;
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            transition: border-color 0.2s, box-shadow 0.2s;
            -webkit-tap-highlight-color: transparent;
          }
          .mv-urgent-text-card:active {
            opacity: 0.85;
            transform: scale(0.99);
          }
          @media (hover: hover) {
            .mv-urgent-text-card:hover {
              border-color: rgba(251,146,60,0.4);
              box-shadow: 0 4px 20px rgba(251,146,60,0.1);
            }
          }
          .mv-urgent-badge {
            display: inline-flex;
            align-items: center;
            font-size: 0.625rem;
            font-weight: 700;
            background: rgba(251,146,60,0.12);
            color: #fb923c;
            border: 1px solid rgba(251,146,60,0.25);
            border-radius: 5px;
            padding: 2px 7px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            white-space: nowrap;
            flex-shrink: 0;
            margin-top: 2px;
          }

        `}</style>

        <div className="mv-inner-header-bg">
          <div className="mv-container" style={{ textAlign: 'center' }}>
            <Link
              href={`/properties?location=${encodeURIComponent(location)}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--mv-text-secondary)', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '1.25rem', fontFamily: 'Outfit, sans-serif' }}
            >
              <ArrowLeft size={14} /> {lang === 'mr' ? `${location} वर परत` : `Back to ${location}`}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={20} color="#fb923c" />
              </div>
              <h1 className="mv-heading-xl" style={{ color: 'var(--mv-text)', margin: 0 }}>
                {lang === 'mr' ? 'तातडीच्या मालमत्ता' : 'Urgent Properties'}
              </h1>
            </div>
            <p style={{ color: 'var(--mv-text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
              <MapPin size={13} style={{ display: 'inline', marginRight: '4px', color: 'var(--mv-accent)' }} />
              {location} &mdash;{' '}
              <span style={{ color: '#fb923c', fontWeight: 600 }}>{urgentItems.length}</span>{' '}
              {urgentItems.length === 1 ? 'listing' : 'listings'}
            </p>
          </div>
        </div>

        <div className="mv-container">
          {urgentItems.length === 0 ? (
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
            }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(251,146,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={32} color="#fb923c" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif', color: 'var(--mv-text)', margin: 0 }}>
                {lang === 'mr' ? 'सध्या कोणत्याही तातडीच्या मालमत्ता नाहीत' : 'No Urgent Properties Right Now'}
              </h3>
              <p style={{ color: 'var(--mv-text-secondary)', margin: 0, maxWidth: '320px' }}>
                {lang === 'mr' ? 'या श्रेणीत सध्या कोणतीही मालमत्ता उपलब्ध नाही. लवकरच परत तपासा किंवा इतर पर्याय पाहा.' : 'No properties available in this category right now. Check back soon or explore other options.'}
              </p>
              <Link href={`/properties?location=${encodeURIComponent(location)}&category=rent`} className="mv-btn mv-btn-secondary" style={{ marginTop: '0.5rem' }}>
                {lang === 'mr' ? 'त्याऐवजी भाड्याच्या मालमत्ता पाहा' : 'View Rent Properties Instead'}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {urgentItems.map((item) => (
                <div key={item.id} className="mv-urgent-text-card">
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Flame size={17} color="#fb923c" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: '0 0 4px 0',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      color: 'var(--mv-text)',
                      lineHeight: 1.4,
                      fontSize: '0.9375rem',
                    }}>
                      {item.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--mv-accent)', fontSize: '0.8125rem', fontWeight: 500 }}>
                        <MapPin size={11} />
                        {item.location}
                      </span>
                      <span style={{ color: 'var(--mv-text-secondary)', fontSize: '0.75rem' }}>
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <span className="mv-urgent-badge">URGENT</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Shared data for normal / rent views ─────────────────────────────────────
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
    whereFilter.approximateLocation = { contains: location, mode: 'insensitive' };
  }

  if (minPrice || maxPrice) {
    whereFilter.price = {};
    if (minPrice) whereFilter.price.gte = parseFloat(minPrice);
    if (maxPrice) whereFilter.price.lte = parseFloat(maxPrice);
  }

  // ─── Step 2b: Rent properties — filter by priceType = PER_MONTH ──────────────
  if (isSpecialLocation && category === 'rent') {
    whereFilter.priceType = 'PER_MONTH';
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
  const isLocked = false;
  const safeProperties = properties;

  // Page heading depending on context
  const pageHeading = isSpecialLocation && category === 'rent'
    ? `Rent Properties — ${location}`
    : t('properties.title', lang);

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
          {/* Back link for rent category */}
          {isSpecialLocation && category === 'rent' && (
            <Link
              href={`/properties?location=${encodeURIComponent(location)}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--mv-text-secondary)', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '1.25rem', fontFamily: 'Outfit, sans-serif' }}
            >
              <ArrowLeft size={14} /> Back to {location}
            </Link>
          )}

          {isSpecialLocation && category === 'rent' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,179,237,0.15)', border: '1px solid rgba(99,179,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={20} color="#63b3ed" />
              </div>
              <h1 className="mv-heading-xl" style={{ color: 'var(--mv-text)', margin: 0 }}>
                Rent Properties
              </h1>
            </div>
          )}

          {(!isSpecialLocation || !category) && (
            <h1 className="mv-heading-xl" style={{ color: 'var(--mv-text)', marginBottom: 'var(--mv-space-sm)' }}>
              {pageHeading}
            </h1>
          )}

          <p className="mv-body" style={{ color: 'var(--mv-text-secondary)' }}>
            {isSpecialLocation && category === 'rent' && (
              <><MapPin size={13} style={{ display: 'inline', marginRight: '4px', color: 'var(--mv-accent)' }} />{location} &mdash;{' '}</>
            )}
            {t('properties.showing', lang)}{' '}
            <span style={{ color: 'var(--mv-accent)', fontWeight: 700 }}>{properties.length}</span>{' '}
            {properties.length === 1 ? t('properties.property', lang) : t('properties.properties', lang)}{' '}
            {t('properties.availableNow', lang)}
          </p>
        </div>
      </div>

      <div className="mv-container">

        {/* Filters — hide for special-location category views (they use back nav) */}
        {!(isSpecialLocation && category) && (
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
        )}

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
              width: '64px', height: '64px', borderRadius: '50%',
              background: category === 'rent' ? 'rgba(99,179,237,0.1)' : 'rgba(245, 197, 24, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: category === 'rent' ? '#63b3ed' : 'var(--mv-accent)'
            }}>
              {category === 'rent' ? <Key size={32} strokeWidth={1.5} /> : <Search size={32} strokeWidth={1.5} />}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif', color: 'var(--mv-text)', margin: 0 }}>
              No Properties Available in This Category Right Now
            </h3>
            <p style={{ color: 'var(--mv-text-secondary)', margin: 0, maxWidth: '320px' }}>
              {isSpecialLocation && category === 'rent'
                ? `No rental properties found in ${location} at the moment. Please check back later.`
                : (t('properties.noResultsHint', lang) || "We couldn't find any exact matches. Try adjusting your search or filters to see more results.")}
            </p>
            {isSpecialLocation && category === 'rent' && (
              <Link href={`/properties?location=${encodeURIComponent(location)}&category=urgent`} className="mv-btn mv-btn-secondary" style={{ marginTop: '0.5rem' }}>
                View Urgent Properties Instead
              </Link>
            )}
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