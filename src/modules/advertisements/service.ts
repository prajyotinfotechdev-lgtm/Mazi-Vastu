// ─── Advertisement Service ──────────────────────────────────────────────────
// COMPLETELY INDEPENDENT from the Property module.
// This module has ZERO imports from properties/, ZERO FK to Property table.
//
// BRD v1.0 mandate: "Advertisement is a completely independent module."
// Changing/deleting an ad NEVER modifies a property and vice versa.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logging/logger';
import { AuditService } from '@/modules/audit/service';
import { createPaginatedResponse, type PaginatedResponse } from '@/lib/validation/schemas';
import slugify from 'slugify';
import type { Prisma, PlacementZone, Advertisement } from '@prisma/client';
import type {
  CreateAdvertisementInput,
  UpdateAdvertisementInput,
  AdvertisementPlacementInput,
  AdvertisementFilterInput,
  PublicAdvertisementFilterInput,
} from './schemas';

// ─── Constants ───────────────────────────────────────────────────────────────

const adWithRelations = {
  media: {
    orderBy: { sortOrder: 'asc' as const },
  },
  placements: {
    orderBy: { sortOrder: 'asc' as const },
  },
};

// ─── Service ─────────────────────────────────────────────────────────────────

export class AdvertisementService {
  /**
   * Creates a new advertisement in DRAFT status.
   * NO relationship to Property is created.
   */
  static async create(input: CreateAdvertisementInput, adminId: string) {
    const baseSlug = slugify(input.title, { lower: true, strict: true });
    const slug = await this.ensureUniqueSlug(baseSlug);

    const advertisement = await prisma.advertisement.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        projectInformation: input.projectInformation,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        status: input.status || 'DRAFT',
        startDate: input.startDate,
        endDate: input.endDate,
        sortOrder: input.sortOrder,
        ...(input.media && input.media.length > 0 && {
          media: {
            create: input.media.map((m, index) => ({
              publicId: m.publicId,
              publicUrl: m.publicUrl,
              mediaType: m.mediaType,
              mimeType: m.mimeType,
              sortOrder: index,
            }))
          }
        })
      },
      include: adWithRelations,
    });

    await AuditService.log({
      adminId,
      action: 'ADVERTISEMENT_CREATED',
      entityType: 'Advertisement',
      entityId: advertisement.id,
      metadata: { title: advertisement.title },
    });

    logger.info('Advertisement created', {
      adId: advertisement.id,
      slug: advertisement.slug,
    });

    return advertisement;
  }

  /**
   * Updates an existing advertisement.
   * NEVER touches any Property data.
   */
  static async update(
    adId: string,
    input: UpdateAdvertisementInput,
    adminId: string
  ) {
    const existing = await prisma.advertisement.findUnique({
      where: { id: adId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Advertisement', adId);
    }

    const data: Prisma.AdvertisementUpdateInput = {};
    if (input.title !== undefined) {
      data.title = input.title;
      data.slug = slugify(input.title, { lower: true, strict: true });
    }
    if (input.description !== undefined) data.description = input.description;
    if (input.projectInformation !== undefined) data.projectInformation = input.projectInformation;
    if (input.contactName !== undefined) data.contactName = input.contactName;
    if (input.contactPhone !== undefined) data.contactPhone = input.contactPhone;
    if (input.contactEmail !== undefined) data.contactEmail = input.contactEmail;
    if (input.startDate !== undefined) data.startDate = input.startDate;
    if (input.endDate !== undefined) data.endDate = input.endDate;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
    if (input.status !== undefined) data.status = input.status;
    if (input.media !== undefined) {
      data.media = {
        deleteMany: {},
        create: input.media.map((m, index) => ({
          publicId: m.publicId,
          publicUrl: m.publicUrl,
          mediaType: m.mediaType,
          mimeType: m.mimeType,
          sortOrder: index,
        })),
      };
    }

    const advertisement = await prisma.advertisement.update({
      where: { id: adId },
      data,
      include: adWithRelations,
    });

    await AuditService.log({
      adminId,
      action: 'ADVERTISEMENT_UPDATED',
      entityType: 'Advertisement',
      entityId: adId,
      metadata: { changedFields: Object.keys(input) },
    });

    return advertisement;
  }

  /**
   * Activates an advertisement.
   * Validates that start/end dates are set.
   */
  static async activate(adId: string, adminId: string) {
    const existing = await prisma.advertisement.findUnique({
      where: { id: adId, deletedAt: null },
      include: { placements: true },
    });

    if (!existing) {
      throw new NotFoundError('Advertisement', adId);
    }

    if (!existing.startDate || !existing.endDate) {
      throw new ValidationError(
        'Start date and end date are required to activate an advertisement'
      );
    }

    if (existing.placements.length === 0) {
      throw new ValidationError(
        'At least one placement zone must be assigned before activation'
      );
    }

    const advertisement = await prisma.advertisement.update({
      where: { id: adId },
      data: { status: 'ACTIVE' },
      include: adWithRelations,
    });

    await AuditService.log({
      adminId,
      action: 'ADVERTISEMENT_ACTIVATED',
      entityType: 'Advertisement',
      entityId: adId,
    });

    return advertisement;
  }

  /**
   * Deactivates an advertisement.
   */
  static async deactivate(adId: string, adminId: string) {
    const existing = await prisma.advertisement.findUnique({
      where: { id: adId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Advertisement', adId);
    }

    const advertisement = await prisma.advertisement.update({
      where: { id: adId },
      data: { status: 'INACTIVE' },
      include: adWithRelations,
    });

    await AuditService.log({
      adminId,
      action: 'ADVERTISEMENT_DEACTIVATED',
      entityType: 'Advertisement',
      entityId: adId,
    });

    return advertisement;
  }

  /**
   * Soft-deletes (archives) an advertisement.
   * NEVER touches any Property data.
   */
  static async delete(adId: string, adminId: string) {
    const existing = await prisma.advertisement.findUnique({
      where: { id: adId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Advertisement', adId);
    }

    await prisma.advertisement.update({
      where: { id: adId },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });

    await AuditService.log({
      adminId,
      action: 'ADVERTISEMENT_DELETED',
      entityType: 'Advertisement',
      entityId: adId,
    });
  }

  /**
   * Assigns placement zones to an advertisement.
   * Replaces existing placements (upsert strategy).
   */
  static async updatePlacements(
    adId: string,
    input: AdvertisementPlacementInput,
    adminId: string
  ) {
    const existing = await prisma.advertisement.findUnique({
      where: { id: adId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Advertisement', adId);
    }

    // Transaction: delete old placements + create new ones
    await prisma.$transaction(async (tx) => {
      await tx.advertisementPlacement.deleteMany({
        where: { advertisementId: adId },
      });

      await tx.advertisementPlacement.createMany({
        data: input.placements.map((p) => ({
          advertisementId: adId,
          placementZone: p.placementZone,
          pageContext: p.pageContext || null,
          categoryContext: p.categoryContext || null,
          sortOrder: p.sortOrder,
        })),
      });
    });

    await AuditService.log({
      adminId,
      action: 'ADVERTISEMENT_PLACEMENTS_UPDATED',
      entityType: 'Advertisement',
      entityId: adId,
      metadata: {
        zones: input.placements.map((p) => p.placementZone),
      },
    });

    return this.getById(adId);
  }

  /**
   * Gets an advertisement by ID (admin).
   */
  static async getById(adId: string) {
    const advertisement = await prisma.advertisement.findUnique({
      where: { id: adId, deletedAt: null },
      include: adWithRelations,
    });

    if (!advertisement) {
      throw new NotFoundError('Advertisement', adId);
    }

    return advertisement;
  }

  /**
   * Gets a published advertisement by slug (public).
   * Only returns currently eligible ads.
   */
  static async getBySlug(slug: string) {
    const now = new Date();

    const advertisement = await prisma.advertisement.findFirst({
      where: {
        slug,
        status: 'ACTIVE',
        deletedAt: null,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: adWithRelations,
    });

    if (!advertisement) {
      throw new NotFoundError('Advertisement', slug);
    }

    return advertisement;
  }

  /**
   * Lists advertisements with filtering (admin).
   */
  static async list(
    filters: AdvertisementFilterInput
  ): Promise<PaginatedResponse<unknown>> {
    const { page, pageSize, status, placement, q } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AdvertisementWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(placement && {
        placements: {
          some: { placementZone: placement },
        },
      }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [advertisements, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        include: adWithRelations,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.advertisement.count({ where }),
    ]);

    return createPaginatedResponse(advertisements, total, page, pageSize);
  }

  /**
   * Lists currently eligible advertisements for public display.
   * Calculates time-window eligibility at query time — no cron dependency.
   *
   * Eligibility: status=ACTIVE AND now >= startDate AND now <= endDate AND not deleted
   */
  static async listPublic(
    filters: PublicAdvertisementFilterInput
  ): Promise<PaginatedResponse<unknown>> {
    const { page, pageSize, placement, pageContext, categoryContext } = filters;
    const skip = (page - 1) * pageSize;
    const now = new Date();

    const where: Prisma.AdvertisementWhereInput = {
      status: 'ACTIVE',
      deletedAt: null,
      startDate: { lte: now },
      endDate: { gte: now },
      ...(placement && {
        placements: {
          some: {
            placementZone: placement,
            ...(pageContext !== undefined && { pageContext }),
            ...(categoryContext !== undefined && { categoryContext }),
          },
        },
      }),
    };

    const [advertisements, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        include: {
          media: {
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              publicUrl: true,
              mediaType: true,
              altText: true,
              sortOrder: true,
              width: true,
              height: true,
            },
          },
          placements: {
            select: {
              placementZone: true,
              pageContext: true,
              categoryContext: true,
              sortOrder: true,
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.advertisement.count({ where }),
    ]);

    return createPaginatedResponse(advertisements, total, page, pageSize);
  }

  /**
   * Serializes advertisement for public display.
   * Strips admin notes, internal config, audit info.
   */
  static serializePublic(ad: Advertisement & { media: unknown[]; placements: unknown[] }) {
    return {
      id: ad.id,
      title: ad.title,
      slug: ad.slug,
      description: ad.description,
      projectInformation: ad.projectInformation,
      contactName: ad.contactName,
      contactPhone: ad.contactPhone,
      contactEmail: ad.contactEmail,
      media: ad.media,
      placements: ad.placements,
    };
  }

  /**
   * Ensures a slug is unique.
   */
  private static async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.advertisement.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing) return slug;

      slug = `${baseSlug}-${counter}`;
      counter++;

      if (counter > 100) {
        slug = `${baseSlug}-${Date.now()}`;
        return slug;
      }
    }
  }
}
