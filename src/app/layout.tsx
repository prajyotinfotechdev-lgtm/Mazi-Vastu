import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = 'https://mazivastu.com';

export const viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'MaziVastu | Property in Latur | Buy Sell Rent Latur District',
    template: '%s | MaziVastu Latur',
  },
  description:
    'MaziVastu — #1 property portal for Latur district, Maharashtra. Buy, sell or rent homes, plots, flats & shops in Latur, Udgir, Nilanga, Ausa, Ahmedpur and all talukas. लातूर जिल्ह्यातील सर्वोत्तम मालमत्ता पोर्टल.',
  keywords: [
    'property in latur',
    'latur property',
    'latur real estate',
    'latur mein ghar',
    'plot for sale latur',
    'flat in latur',
    'ghar vikne ahe latur',
    'latur jilha property',
    'property latur maharashtra',
    'udgir property',
    'nilanga property',
    'ausa property',
    'ahmedpur property',
    'chakur property',
    'deoni property',
    'renapur property',
    'jalkot property',
    'shirur anantpal property',
    'buy property latur district',
    'latur madhe ghar vikayche ahe',
    'MaziVastu',
    'माझी वास्तु',
  ],
  authors: [{ name: 'MaziVastu', url: BASE_URL }],
  creator: 'MaziVastu',
  publisher: 'MaziVastu',
  alternates: {
    canonical: BASE_URL,
    languages: {
      'mr-IN': `${BASE_URL}`,
      'en-IN': `${BASE_URL}`,
    },
  },
  openGraph: {
    title: 'MaziVastu | Property in Latur | Buy Sell Rent Latur District',
    description:
      'Find your dream property in Latur district, Maharashtra. Homes, plots, flats, shops & commercial properties in Latur, Udgir, Nilanga, Ausa and more.',
    url: BASE_URL,
    siteName: 'MaziVastu',
    locale: 'mr_IN',
    alternateLocale: ['en_IN'],
    type: 'website',
    images: [
      {
        url: `${BASE_URL}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'MaziVastu - Property in Latur District',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaziVastu | Property in Latur | Buy Sell Rent',
    description: 'Find your dream property in Latur district, Maharashtra.',
    images: [`${BASE_URL}/images/og-image.jpg`],
    creator: '@mazivastu',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN', // Replace with actual token
  },
  manifest: '/manifest.json',
  category: 'real estate',
};

// JSON-LD structured data
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  name: 'MaziVastu',
  alternateName: 'माझी वास्तु',
  url: BASE_URL,
  logo: `${BASE_URL}/images/logo.jpg`,
  description:
    'MaziVastu is the leading property portal for Latur district, Maharashtra. We help buyers, sellers and tenants find the perfect property.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Latur',
    addressRegion: 'Maharashtra',
    postalCode: '413512',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 18.4088,
    longitude: 76.5604,
  },
  areaServed: [
    'Latur', 'Udgir', 'Nilanga', 'Ausa', 'Chakur',
    'Deoni', 'Renapur', 'Ahmedpur', 'Shirur Anantpal', 'Jalkot',
    'Latur District', 'Maharashtra',
  ],
  sameAs: [
    'https://www.facebook.com/mazivastu',
    'https://www.instagram.com/mazivastu',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MaziVastu',
  url: BASE_URL,
  description: 'Find properties in Latur district, Maharashtra',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/properties?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: ['mr', 'en'],
};

import { Plus_Jakarta_Sans } from 'next/font/google';
import ToasterProvider from '@/components/providers/ToasterProvider';
import { LoaderProvider } from '@/components/providers/LoaderProvider';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

import { getLanguage } from '@/lib/i18n/get-language';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = getLanguage();
  return (
    <html lang={lang} className={plusJakarta.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Latur, Maharashtra" />
        <meta name="geo.position" content="18.4088;76.5604" />
        <meta name="ICBM" content="18.4088, 76.5604" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <LoaderProvider>
          <ToasterProvider />
          {children}
        </LoaderProvider>
      </body>
    </html>
  );
}

