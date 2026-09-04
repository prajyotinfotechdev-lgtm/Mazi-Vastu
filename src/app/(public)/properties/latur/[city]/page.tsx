import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Home, Building2, Map, ArrowRight, Star, TrendingUp, Phone } from 'lucide-react';
import { LATUR_CITIES, LATUR_DISTRICT_META } from '@/lib/seo/latur-cities';
import { prisma } from '@/lib/db/prisma';
import PropertyCard from '@/components/public/PropertyCard';

const BASE_URL = 'https://mazivastu.com';

interface PageProps {
  params: { city: string };
}

// export async function generateStaticParams() {
//   return LATUR_CITIES.map((city) => ({ city: city.slug }));
// }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const city = LATUR_CITIES.find((c) => c.slug === params.city);
  if (!city) return { title: 'Not Found' };

  const title = `Property in ${city.name} Latur | Buy Sell Rent | MaziVastu`;
  const description = `Find verified properties in ${city.name}, Latur district. Buy, sell or rent homes, plots, flats & commercial property in ${city.name}. ${city.marathiDescription}`;
  const url = `${BASE_URL}/properties/latur/${city.slug}`;

  return {
    title,
    description,
    keywords: [
      `property in ${city.name.toLowerCase()}`,
      `${city.name.toLowerCase()} property`,
      `${city.name.toLowerCase()} latur property`,
      `plot for sale ${city.name.toLowerCase()}`,
      `flat in ${city.name.toLowerCase()}`,
      `ghar vikne ahe ${city.marathiName}`,
      `${city.marathiName} madhe ghar`,
      `${city.name.toLowerCase()} real estate`,
      `buy property ${city.name.toLowerCase()} latur`,
      `${city.name.toLowerCase()} mein makaan`,
      ...city.nearbyAreas.map(a => `property near ${a.toLowerCase()}`),
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'MaziVastu',
      locale: 'mr_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CityLandingPage({ params }: PageProps) {
  const city = LATUR_CITIES.find((c) => c.slug === params.city);
  if (!city) notFound();

  // Fetch properties for this city from DB (fuzzy match on location)
  const properties = await prisma.property.findMany({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
      OR: [
        { approximateLocation: { contains: city.name, mode: 'insensitive' } },
        { approximateLocation: { contains: city.taluka, mode: 'insensitive' } },
        { title: { contains: city.name, mode: 'insensitive' } },
      ],
    },
    include: { media: { orderBy: { sortOrder: 'asc' }, take: 1 }, propertyType: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  });

  // All properties count for this city
  const totalCount = await prisma.property.count({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
      OR: [
        { approximateLocation: { contains: city.name, mode: 'insensitive' } },
        { approximateLocation: { contains: city.taluka, mode: 'insensitive' } },
      ],
    },
  });

  // Breadcrumb JSON-LD
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Properties', item: `${BASE_URL}/properties` },
      { '@type': 'ListItem', position: 3, name: 'Latur District', item: `${BASE_URL}/properties/latur/latur` },
      { '@type': 'ListItem', position: 4, name: `${city.name}`, item: `${BASE_URL}/properties/latur/${city.slug}` },
    ],
  };

  // LocalBusiness JSON-LD per city
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: `MaziVastu - ${city.name}`,
    description: city.description,
    url: `${BASE_URL}/properties/latur/${city.slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city.name,
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city.lat,
      longitude: city.lng,
    },
    areaServed: [city.name, ...city.nearbyAreas],
  };

  // FAQ JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What types of property are available in ${city.name}, Latur?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `In ${city.name}, Latur district, you can find homes (घर), open plots, flats, row houses, shops, and agricultural land. MaziVastu lists verified properties across all categories in ${city.name} and nearby areas.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the property rate in ${city.name} Latur?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Property rates in ${city.name}, Latur district vary by type and location. Residential plots start from affordable rates. Visit MaziVastu to see current listings and real prices in ${city.name}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Is ${city.name} a good place to invest in property?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${city.name} in Latur district, Maharashtra, ${city.description} MaziVastu can help you find the best investment opportunities in ${city.name}.`,
        },
      },
      {
        '@type': 'Question',
        name: `How to buy property in ${city.name}, Latur?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `To buy property in ${city.name}, Latur, browse verified listings on MaziVastu. Register your details once and get direct contact with sellers. Our allied services also include home loans, legal documentation, and vastu consultation.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ background: 'var(--mv-bg)', minHeight: '100vh' }}>
        <style>{`
          .city-hero {
            background: linear-gradient(135deg, #0a0a0c 0%, #111117 50%, #0a0a0c 100%);
            border-bottom: 1px solid rgba(245, 197, 24, 0.1);
            padding: 3rem 1rem 4rem;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .city-hero::before {
            content: '';
            position: absolute;
            top: -50%;
            left: 50%;
            transform: translateX(-50%);
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(245,197,24,0.06) 0%, transparent 70%);
            pointer-events: none;
          }
          .city-breadcrumb {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.8rem;
            color: var(--mv-text-muted);
            justify-content: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
          }
          .city-breadcrumb a {
            color: var(--mv-text-muted);
            text-decoration: none;
            transition: color 0.2s;
          }
          .city-breadcrumb a:hover { color: var(--mv-accent); }
          .city-breadcrumb span { color: var(--mv-accent); }
          .city-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(245, 197, 24, 0.1);
            border: 1px solid rgba(245, 197, 24, 0.2);
            border-radius: 999px;
            padding: 4px 14px;
            font-size: 0.75rem;
            color: var(--mv-accent);
            font-weight: 600;
            margin-bottom: 1rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .city-stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            max-width: 500px;
            margin: 2rem auto 0;
          }
          .city-stat-box {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 12px;
            padding: 12px 8px;
            text-align: center;
          }
          .city-stat-value {
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--mv-accent);
            font-family: Outfit, sans-serif;
          }
          .city-stat-label {
            font-size: 0.7rem;
            color: var(--mv-text-muted);
            margin-top: 2px;
          }
          .nearby-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 1rem;
          }
          .nearby-tag {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 999px;
            padding: 4px 12px;
            font-size: 0.75rem;
            color: var(--mv-text-secondary);
          }
          .city-section {
            max-width: 1100px;
            margin: 0 auto;
            padding: 3rem 1rem;
          }
          .section-heading {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--mv-text);
            font-family: Outfit, sans-serif;
            margin: 0 0 1.5rem;
          }
          .faq-item {
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 12px;
            background: rgba(255,255,255,0.02);
          }
          .faq-question {
            padding: 16px 20px;
            font-weight: 600;
            color: var(--mv-text);
            font-size: 0.9375rem;
          }
          .faq-answer {
            padding: 0 20px 16px;
            color: var(--mv-text-secondary);
            font-size: 0.875rem;
            line-height: 1.7;
          }
          .other-cities-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          @media (min-width: 640px) {
            .other-cities-grid { grid-template-columns: repeat(3, 1fr); }
          }
          @media (min-width: 1024px) {
            .other-cities-grid { grid-template-columns: repeat(5, 1fr); }
            .city-stats-grid { grid-template-columns: repeat(3, 1fr); }
          }
          .other-city-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 14px 10px;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 12px;
            background: rgba(255,255,255,0.02);
            text-decoration: none;
            color: var(--mv-text);
            font-size: 0.875rem;
            font-weight: 600;
            text-align: center;
            transition: all 0.2s ease;
          }
          .other-city-card:hover {
            border-color: rgba(245,197,24,0.3);
            background: rgba(245,197,24,0.05);
            color: var(--mv-accent);
            transform: translateY(-2px);
          }
          .other-city-card .marathi {
            font-size: 0.75rem;
            color: var(--mv-text-muted);
            font-weight: 400;
          }
          .cta-box {
            background: linear-gradient(135deg, rgba(245,197,24,0.1), rgba(245,197,24,0.03));
            border: 1px solid rgba(245,197,24,0.2);
            border-radius: 20px;
            padding: 2.5rem;
            text-align: center;
          }
        `}</style>

        {/* Hero Section */}
        <div className="city-hero">
          {/* Breadcrumb */}
          <nav className="city-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/properties">Properties</Link>
            <span>/</span>
            <Link href="/properties/latur/latur">Latur District</Link>
            <span>/</span>
            <span style={{ color: 'var(--mv-text)' }}>{city.name}</span>
          </nav>

          <div className="city-badge">
            <MapPin size={12} />
            Latur District, Maharashtra
          </div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 5vw, 3rem)',
            fontWeight: 800,
            color: 'var(--mv-text)',
            fontFamily: 'Outfit, sans-serif',
            margin: '0 0 0.5rem',
            lineHeight: 1.2,
          }}>
            Property in <span style={{ color: 'var(--mv-accent)' }}>{city.name}</span>, Latur
          </h1>

          <p style={{ color: 'var(--mv-text-secondary)', maxWidth: '600px', margin: '0.75rem auto 0', fontSize: '1rem', lineHeight: 1.6 }}>
            {city.description}
          </p>

          {/* Marathi tagline */}
          <p style={{ color: 'var(--mv-accent)', fontSize: '0.875rem', marginTop: '0.5rem', fontWeight: 500 }}>
            {city.marathiName} मध्ये मालमत्ता खरेदी-विक्री-भाडे
          </p>

          <div className="city-stats-grid">
            <div className="city-stat-box">
              <div className="city-stat-value">{totalCount}+</div>
              <div className="city-stat-label">Listings</div>
            </div>
            <div className="city-stat-box">
              <div className="city-stat-value">✓</div>
              <div className="city-stat-label">Verified</div>
            </div>
            <div className="city-stat-box">
              <div className="city-stat-value">Free</div>
              <div className="city-stat-label">To Browse</div>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="city-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="section-heading" style={{ margin: 0 }}>
              Properties in {city.name}
            </h2>
            <Link href={`/properties?q=${encodeURIComponent(city.name)}`} className="mv-btn mv-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {properties.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {properties.map((prop) => (
                <PropertyCard key={prop.id} property={prop as any} isLocked={false} lang="en" variant="horizontal" />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <Home size={40} color="var(--mv-accent)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--mv-text)', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
                New Listings Coming Soon in {city.name}
              </h3>
              <p style={{ color: 'var(--mv-text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                Be the first to list your property in {city.name} and reach thousands of buyers in Latur district.
              </p>
              <Link href="/contact" className="mv-btn mv-btn-primary">
                List Your Property
              </Link>
            </div>
          )}
        </div>

        {/* Nearby Areas */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem 3rem' }}>
          <h2 className="section-heading">Nearby Areas in {city.name}</h2>
          <div className="nearby-tags">
            {city.nearbyAreas.map((area) => (
              <Link
                key={area}
                href={`/properties?q=${encodeURIComponent(area)}`}
                className="nearby-tag"
                style={{ textDecoration: 'none' }}
              >
                {area}
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem 3rem' }}>
          <h2 className="section-heading">
            Frequently Asked Questions — Property in {city.name}
          </h2>
          <div>
            {[
              {
                q: `What types of property are available in ${city.name}, Latur?`,
                a: `In ${city.name}, Latur district, you can find homes (घर), open plots, flats, row houses, shops, and agricultural land. MaziVastu lists verified properties across all categories in ${city.name} and nearby areas.`,
              },
              {
                q: `What is the property rate in ${city.name} Latur?`,
                a: `Property rates in ${city.name}, Latur district vary by type and location. Residential plots start from affordable rates. Browse MaziVastu to see current listings with real prices in ${city.name}.`,
              },
              {
                q: `Is ${city.name} a good place to invest in property?`,
                a: `${city.description} MaziVastu can help you find the best investment opportunities in ${city.name} with verified listings and expert guidance.`,
              },
              {
                q: `How to buy property in ${city.name}, Latur?`,
                a: `To buy property in ${city.name}, Latur, browse verified listings on MaziVastu. Register your details once and get direct seller contact. Our allied services also include home loans, legal documentation, and vastu consultation.`,
              },
              {
                q: `${city.marathiName} मध्ये घर विकत घ्यायचे कसे?`,
                a: `${city.marathiName} मध्ये घर खरेदी करण्यासाठी माझी वास्तु वर verified listings पहा. एकदा नोंदणी करा आणि थेट विक्रेत्याशी संपर्क करा. गृहकर्ज, कायदेशीर कागदपत्रे आणि वास्तु सल्ल्यासाठी आमच्या allied services वापरा.`,
              },
            ].map((faq, idx) => (
              <div key={idx} className="faq-item">
                <div className="faq-question">{faq.q}</div>
                <div className="faq-answer">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Cities in Latur District */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem 3rem' }}>
          <h2 className="section-heading">
            Property in Other Cities — Latur District
          </h2>
          <div className="other-cities-grid">
            {LATUR_CITIES.filter((c) => c.slug !== city.slug).map((c) => (
              <Link key={c.slug} href={`/properties/latur/${c.slug}`} className="other-city-card">
                <MapPin size={16} color="var(--mv-accent)" />
                <span>{c.name}</span>
                <span className="marathi">{c.marathiName}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem 4rem' }}>
          <div className="cta-box">
            <TrendingUp size={40} color="var(--mv-accent)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', color: 'var(--mv-text)', margin: '0 0 0.5rem' }}>
              Sell or Rent Your Property in {city.name}
            </h2>
            <p style={{ color: 'var(--mv-text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              List your property on MaziVastu and reach thousands of verified buyers and tenants across Latur district — completely free.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact" className="mv-btn mv-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} /> Contact Us
              </Link>
              <Link href="/properties" className="mv-btn mv-btn-secondary">
                Browse All Properties
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
