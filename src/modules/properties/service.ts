// ─── Property Service ───────────────────────────────────────────────────────
// Core property business logic: CRUD, publishing workflow, search, filtering.
// All operations go through this service — route handlers stay thin.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logging/logger';
import { validateDynamicFields } from '@/modules/custom-fields/validator';
import { AuditService } from '@/modules/audit/service';
import slugify from 'slugify';
import type { Prisma, PropertyStatus } from '@prisma/client';
import type { CreatePropertyInput, UpdatePropertyInput, PropertyFilterInput, PublicPropertyFilterInput } from './schemas';
import { createPaginatedResponse, type PaginatedResponse } from '@/lib/validation/schemas';

// ─── Types ───────────────────────────────────────────────────────────────────

const propertyWithRelations = {
  propertyType: {
    select: { id: true, name: true, slug: true },
  },
  media: {
    orderBy: { sortOrder: 'asc' as const },
  },
};

// ─── Service ─────────────────────────────────────────────────────────────────

export class PropertyService {
  /**
   * Creates a new property in DRAFT status.
   */
  static async create(
    input: CreatePropertyInput,
    adminId: string
  ) {
    // Verify property type exists
    const propertyType = await prisma.propertyType.findUnique({
      where: { id: input.propertyTypeId, deletedAt: null },
    });

    if (!propertyType) {
      throw new NotFoundError('PropertyType', input.propertyTypeId);
    }

    // Validate dynamic fields if provided
    let validatedMetadata = {};
    if (input.metadata && Object.keys(input.metadata).length > 0) {
      validatedMetadata = await validateDynamicFields(input.metadata);
    }

    // Generate slug from title
    const baseSlug = slugify(input.title, { lower: true, strict: true });
    const slug = await this.ensureUniqueSlug(baseSlug);

    const property = await prisma.property.create({
      data: {
        slug,
        title: input.title,
        description: input.description,
        propertyTypeId: input.propertyTypeId,
        status: input.status || 'DRAFT',
        approximateLocation: input.approximateLocation,
        gatedLocation: input.gatedLocation,
        size: input.size,
        sizeUnit: input.sizeUnit,
        price: input.price,
        priceType: input.priceType,
        metadata: validatedMetadata,
        seoTitle: input.seoTitle || input.title,
        seoDescription: input.seoDescription || input.description?.substring(0, 160),
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
      include: propertyWithRelations,
    });

    await AuditService.log({
      adminId,
      action: 'PROPERTY_CREATED',
      entityType: 'Property',
      entityId: property.id,
      metadata: { title: property.title, slug: property.slug },
    });

    logger.info('Property created', { propertyId: property.id, slug: property.slug });

    if (property.status === 'PUBLISHED') {
      const idempotencyKey = `new-property:${property.id}`;
      
      const typeName = property.propertyType?.name || 'property';
      const cityName = property.approximateLocation || 'your area';

      await prisma.notificationOutbox.create({
        data: {
          type: 'NEW_PROPERTY',
          payload: {
            propertyId: property.id,
            title: '🚨 New Property Alert!',
            body: `A new ${typeName} was just listed in ${cityName}. Click here to see it before anyone else!`,
            url: `/properties/${property.slug}`,
          },
          idempotencyKey,
        },
      });
    }

    return property;
  }

  /**
   * Updates an existing property.
   */
  static async update(
    propertyId: string,
    input: UpdatePropertyInput,
    adminId: string
  ) {
    const existing = await prisma.property.findUnique({
      where: { id: propertyId, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Property', propertyId);
    }

    // Validate dynamic fields if provided
    let validatedMetadata: Record<string, unknown> | undefined;
    if (input.metadata) {
      validatedMetadata = await validateDynamicFields(input.metadata, true);
      // Merge with existing metadata
      const existingMetadata = (existing.metadata as Record<string, unknown>) || {};
      validatedMetadata = { ...existingMetadata, ...validatedMetadata };
    }

    // Handle slug change
    let newSlug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      // Check uniqueness
      const slugExists = await prisma.property.findUnique({
        where: { slug: input.slug },
      });
      if (slugExists && slugExists.id !== propertyId) {
        throw new ConflictError(`Slug '${input.slug}' is already in use`);
      }

      // Store old slug for redirect
      await prisma.propertySlugHistory.create({
        data: {
          propertyId,
          oldSlug: existing.slug,
        },
      });

      newSlug = input.slug;
    }

    // Verify property type if changing
    if (input.propertyTypeId && input.propertyTypeId !== existing.propertyTypeId) {
      const propertyType = await prisma.propertyType.findUnique({
        where: { id: input.propertyTypeId, deletedAt: null },
      });
      if (!propertyType) {
        throw new NotFoundError('PropertyType', input.propertyTypeId);
      }
    }

    const property = await prisma.property.update({
      where: { id: propertyId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.propertyTypeId !== undefined && { propertyTypeId: input.propertyTypeId }),
        ...(input.approximateLocation !== undefined && { approximateLocation: input.approximateLocation }),
        ...(input.gatedLocation !== undefined && { gatedLocation: input.gatedLocation }),
        ...(input.size !== undefined && { size: input.size }),
        ...(input.sizeUnit !== undefined && { sizeUnit: input.sizeUnit }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.priceType !== undefined && { priceType: input.priceType }),
        ...(validatedMetadata !== undefined && { metadata: validatedMetadata }),
        ...(input.seoTitle !== undefined && { seoTitle: input.seoTitle }),
        ...(input.seoDescription !== undefined && { seoDescription: input.seoDescription }),
        slug: newSlug,
        ...(input.media !== undefined && {
          media: {
            deleteMany: {},
            create: input.media.map((m, index) => ({
              publicId: m.publicId,
              publicUrl: m.publicUrl,
              mediaType: m.mediaType,
              mimeType: m.mimeType,
              sortOrder: index,
            }))
          }
        }),
      },
      include: propertyWithRelations,
    });

    await AuditService.log({
      adminId,
      action: 'PROPERTY_UPDATED',
      entityType: 'Property',
      entityId: property.id,
      metadata: { changedFields: Object.keys(input) },
    });

    return property;
  }

  /**
   * Publishes a property with full validation.
   * Idempotent — publishing an already published property is safe.
   */
  static async publish(propertyId: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const property = await tx.property.findUnique({
        where: { id: propertyId, deletedAt: null },
        include: { media: true },
      });

      if (!property) {
        throw new NotFoundError('Property', propertyId);
      }

      // Validate required fields
      if (!property.title) {
        throw new ValidationError('Property title is required for publishing');
      }

      if (!property.propertyTypeId) {
        throw new ValidationError('Property type is required for publishing');
      }

      // Validate dynamic fields
      const metadata = (property.metadata as Record<string, unknown>) || {};
      await validateDynamicFields(metadata);

      // Validate media (at least one image recommended)
      if (property.media.length === 0) {
        logger.warn('Property published without media', { propertyId });
      }

      // Generate slug if not present
      let slug = property.slug;
      if (!slug) {
        const baseSlug = slugify(property.title, { lower: true, strict: true });
        slug = await PropertyService.ensureUniqueSlug(baseSlug);
      }

      const now = new Date();
      const isAlreadyPublished = property.status === 'PUBLISHED';

      // Update property
      const published = await tx.property.update({
        where: { id: propertyId },
        data: {
          status: 'PUBLISHED',
          slug,
          publishedAt: property.publishedAt || now,
          seoTitle: property.seoTitle || property.title,
          seoDescription: property.seoDescription || property.description?.substring(0, 160),
        },
        include: propertyWithRelations,
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          adminId,
          action: 'PROPERTY_PUBLISHED',
          entityType: 'Property',
          entityId: propertyId,
          metadata: { slug: published.slug, title: published.title },
        },
      });

      // Create notification outbox entry (only for first publish)
      if (!isAlreadyPublished) {
        const idempotencyKey = `new-property:${propertyId}`;

        // Check if notification already exists (idempotent)
        const existingNotification = await tx.notificationOutbox.findUnique({
          where: { idempotencyKey },
        });

        if (!existingNotification) {
            const typeName = published.propertyType?.name || 'property';
            const cityName = published.approximateLocation || 'your area';

            await tx.notificationOutbox.create({
              data: {
                type: 'NEW_PROPERTY',
                payload: {
                  propertyId: published.id,
                  title: '🚨 New Property Alert!',
                  body: `A new ${typeName} was just listed in ${cityName}. Click here to see it before anyone else!`,
                  url: `/properties/${published.slug}`,
                },
                idempotencyKey,
              },
            });
        }
      }

      return published;
    });
  }

  /**
   * Archives/soft-deletes a property.
   */
  static async archive(propertyId: string, adminId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId, deletedAt: null },
    });

    if (!property) {
      throw new NotFoundError('Property', propertyId);
    }

    const archived = await prisma.property.update({
      where: { id: propertyId },
      data: { status: 'ARCHIVED', deletedAt: new Date() },
      include: propertyWithRelations,
    });

    await AuditService.log({
      adminId,
      action: 'PROPERTY_ARCHIVED',
      entityType: 'Property',
      entityId: propertyId,
    });

    return archived;
  }

  /**
   * Gets a property by ID (admin).
   */
  static async getById(propertyId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId, deletedAt: null },
      include: propertyWithRelations,
    });

    if (!property) {
      throw new NotFoundError('Property', propertyId);
    }

    return property;
  }

  /**
   * Gets a published property by slug (public).
   * Also checks slug history for redirects.
   */
  static async getBySlug(slug: string) {
    // Try current slug first
    const property = await prisma.property.findUnique({
      where: { slug, status: 'PUBLISHED', deletedAt: null },
      include: propertyWithRelations,
    });

    if (property) return { property, redirect: null };

    // Check slug history for redirect
    const slugHistory = await prisma.propertySlugHistory.findUnique({
      where: { oldSlug: slug },
      include: {
        property: {
          include: propertyWithRelations,
        },
      },
    });

    if (
      slugHistory?.property &&
      slugHistory.property.status === 'PUBLISHED' &&
      !slugHistory.property.deletedAt
    ) {
      return {
        property: slugHistory.property,
        redirect: slugHistory.property.slug,
      };
    }

    throw new NotFoundError('Property', slug);
  }

  /**
   * Lists properties with filtering (admin).
   */
  static async list(
    filters: PropertyFilterInput
  ): Promise<PaginatedResponse<unknown>> {
    const { page, pageSize, status, propertyTypeId, q } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PropertyWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(propertyTypeId && { propertyTypeId }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: propertyWithRelations,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.property.count({ where }),
    ]);

    return createPaginatedResponse(properties, total, page, pageSize);
  }

  /**
   * Lists published properties for public browsing.
   */
  static async listPublished(
    filters: PublicPropertyFilterInput
  ): Promise<PaginatedResponse<unknown>> {
    const { page, pageSize, propertyTypeId, q, minPrice, maxPrice } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PropertyWhereInput = {
      status: 'PUBLISHED',
      deletedAt: null,
      ...(propertyTypeId && { propertyTypeId }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
    };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: propertyWithRelations,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      prisma.property.count({ where }),
    ]);

    return createPaginatedResponse(properties, total, page, pageSize);
  }

  /**
   * Ensures a slug is unique by appending a numeric suffix if needed.
   */
  private static async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.property.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing) return slug;

      slug = `${baseSlug}-${counter}`;
      counter++;

      if (counter > 100) {
        // Safety valve
        slug = `${baseSlug}-${Date.now()}`;
        return slug;
      }
    }
  }
}
