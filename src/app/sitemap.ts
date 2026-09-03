import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db/prisma';
import { LATUR_CITIES } from '@/lib/seo/latur-cities';

const BASE_URL = 'https://mazivastu.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/properties`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // City landing pages — one per taluka in Latur district
  const cityPages: MetadataRoute.Sitemap = LATUR_CITIES.map((city) => ({
    url: `${BASE_URL}/properties/latur/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Dynamic property listing pages
  let propertyPages: MetadataRoute.Sitemap = [];
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      select: { slug: true, updatedAt: true },
    });
    propertyPages = properties.map((p) => ({
      url: `${BASE_URL}/properties/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }));
  } catch (e) {
    // Gracefully fail if DB not available during static generation
  }

  // Dynamic service pages
  let servicePages: MetadataRoute.Sitemap = [];
  try {
    const services = await prisma.alliedService.findMany({
      where: { isActive: true, deletedAt: null },
      select: { slug: true, updatedAt: true },
    });
    servicePages = services
      .filter((s) => s.slug)
      .map((s) => ({
        url: `${BASE_URL}/services/${s.slug}`,
        lastModified: s.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.65,
      }));
  } catch (e) {
    // Gracefully fail
  }

  return [...staticPages, ...cityPages, ...propertyPages, ...servicePages];
}
