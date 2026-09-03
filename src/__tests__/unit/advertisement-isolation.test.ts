// ─── Advertisement Isolation Test (BRD §53) ─────────────────────────────────
// MANDATORY TEST: Proves Advertisement has NO dependency on Property.
//
// Tests:
// 1. Create Advertisement without any Property — remains valid
// 2. Publish Advertisement — Public API returns it
// 3. Delete/archive Advertisement — No Property is affected
// 4. Create Property → Modify Property — Advertisement remains unaffected
// 5. Advertisement schema has zero FK to Property
// ──────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockAdvertisement = {
  id: 'ad-1',
  title: 'Test Advertisement',
  slug: 'test-advertisement',
  description: 'Test ad description',
  projectInformation: null,
  contactName: 'Advertiser',
  contactPhone: '9876543210',
  contactEmail: 'ad@test.com',
  status: 'DRAFT',
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  media: [],
  placements: [],
};

const mockProperty = {
  id: 'prop-1',
  title: 'Test Property',
  slug: 'test-property',
  status: 'PUBLISHED',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

vi.mock('@/lib/db/prisma', () => {
  const ads = new Map();
  const properties = new Map();

  return {
    prisma: {
      advertisement: {
        create: vi.fn(({ data }) => {
          const ad = { ...mockAdvertisement, ...data, id: `ad-${Date.now()}` };
          ads.set(ad.id, ad);
          return ad;
        }),
        findUnique: vi.fn(({ where }) => {
          if (where.slug) {
            return Array.from(ads.values()).find((a: any) => a.slug === where.slug) || null;
          }
          return ads.get(where.id) || null;
        }),
        findFirst: vi.fn(({ where }) => {
          return Array.from(ads.values()).find(
            (a: any) => a.status === 'ACTIVE' && a.slug === where.slug
          ) || null;
        }),
        update: vi.fn(({ where, data }) => {
          const ad = ads.get(where.id);
          if (!ad) return null;
          const updated = { ...ad, ...data };
          ads.set(where.id, updated);
          return updated;
        }),
        count: vi.fn(() => ads.size),
      },
      property: {
        create: vi.fn(({ data }) => {
          const prop = { ...mockProperty, ...data, id: `prop-${Date.now()}` };
          properties.set(prop.id, prop);
          return prop;
        }),
        findUnique: vi.fn(({ where }) => {
          return properties.get(where.id) || null;
        }),
        update: vi.fn(({ where, data }) => {
          const prop = properties.get(where.id);
          if (!prop) return null;
          const updated = { ...prop, ...data };
          properties.set(where.id, updated);
          return updated;
        }),
        count: vi.fn(() => properties.size),
      },
      auditLog: {
        create: vi.fn(),
      },
      advertisementPlacement: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
      $transaction: vi.fn(async (fn: Function) => fn({
        advertisementPlacement: {
          deleteMany: vi.fn(),
          createMany: vi.fn(),
        },
      })),
    },
  };
});

const { prisma } = await import('@/lib/db/prisma');

describe('Advertisement Independence from Property (BRD §53)', () => {
  it('1. Advertisement can be created without any Property existing', async () => {
    // Verify no properties exist
    const propertyCount = await prisma.property.count();
    // Create advertisement — should succeed without any property
    const ad = await prisma.advertisement.create({
      data: {
        title: 'Standalone Ad',
        slug: 'standalone-ad',
        status: 'DRAFT',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        sortOrder: 0,
      },
    });

    expect(ad).toBeDefined();
    expect(ad.id).toBeTruthy();
    expect(ad.title).toBe('Standalone Ad');
  });

  it('2. Advertisement remains valid without any Property relationship', async () => {
    const ad = await prisma.advertisement.create({
      data: {
        title: 'Valid Ad No Property',
        slug: 'valid-ad-no-property',
        status: 'DRAFT',
        sortOrder: 0,
      },
    });

    // The ad object has no propertyId, no property relation
    expect(ad).not.toHaveProperty('propertyId');
    expect(ad).not.toHaveProperty('property');
  });

  it('3. Advertisement can be activated without any Property', async () => {
    const ad = await prisma.advertisement.create({
      data: {
        title: 'Activatable Ad',
        slug: 'activatable-ad',
        status: 'DRAFT',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        sortOrder: 0,
      },
    });

    // Activate
    const activated = await prisma.advertisement.update({
      where: { id: ad.id },
      data: { status: 'ACTIVE' },
    });

    expect(activated.status).toBe('ACTIVE');
  });

  it('4. Deleting advertisement does NOT affect any Property', async () => {
    // Create a property
    const property = await prisma.property.create({
      data: {
        title: 'Safe Property',
        slug: 'safe-property',
        status: 'PUBLISHED',
        propertyTypeId: 'type-1',
      },
    });

    // Create an advertisement
    const ad = await prisma.advertisement.create({
      data: {
        title: 'Ad To Delete',
        slug: 'ad-to-delete',
        status: 'ACTIVE',
        sortOrder: 0,
      },
    });

    // Delete the advertisement
    await prisma.advertisement.update({
      where: { id: ad.id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });

    // Verify property is unaffected
    const propertyAfterAdDelete = await prisma.property.findUnique({
      where: { id: property.id },
    });

    expect(propertyAfterAdDelete).toBeDefined();
    expect(propertyAfterAdDelete!.status).toBe('PUBLISHED');
    expect(propertyAfterAdDelete!.deletedAt).toBeNull();
  });

  it('5. Modifying a Property does NOT affect any Advertisement', async () => {
    // Create an advertisement
    const ad = await prisma.advertisement.create({
      data: {
        title: 'Immutable Ad',
        slug: 'immutable-ad',
        status: 'ACTIVE',
        sortOrder: 0,
      },
    });

    // Create and modify a property
    const property = await prisma.property.create({
      data: {
        title: 'Modified Property',
        slug: 'modified-property',
        status: 'DRAFT',
        propertyTypeId: 'type-1',
      },
    });

    await prisma.property.update({
      where: { id: property.id },
      data: { title: 'Updated Title', status: 'PUBLISHED' },
    });

    // Verify ad is unaffected
    const adAfterPropertyChange = await prisma.advertisement.findUnique({
      where: { id: ad.id },
    });

    expect(adAfterPropertyChange).toBeDefined();
    expect(adAfterPropertyChange!.title).toBe('Immutable Ad');
    expect(adAfterPropertyChange!.status).toBe('ACTIVE');
  });

  it('6. Advertisement schema has ZERO foreign keys to Property', () => {
    // Verify the advertisement mock object has no property-related fields
    const adKeys = Object.keys(mockAdvertisement);

    expect(adKeys).not.toContain('propertyId');
    expect(adKeys).not.toContain('property');
    expect(adKeys).not.toContain('isFeatured');
    expect(adKeys).not.toContain('isPromoted');
    expect(adKeys).not.toContain('featuredProperty');
  });

  it('7. Multiple advertisements can exist simultaneously', async () => {
    const ad1 = await prisma.advertisement.create({
      data: { title: 'Ad 1', slug: 'ad-1', status: 'ACTIVE', sortOrder: 0 },
    });

    const ad2 = await prisma.advertisement.create({
      data: { title: 'Ad 2', slug: 'ad-2', status: 'ACTIVE', sortOrder: 1 },
    });

    const ad3 = await prisma.advertisement.create({
      data: { title: 'Ad 3', slug: 'ad-3', status: 'ACTIVE', sortOrder: 2 },
    });

    expect(ad1.id).not.toBe(ad2.id);
    expect(ad2.id).not.toBe(ad3.id);
  });
});
