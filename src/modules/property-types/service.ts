// ─── Property Types Service ─────────────────────────────────────────────────
// CRUD + hierarchy management for admin-configurable property types.
// Property types are never hard-coded into business logic.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { AuditService } from '@/modules/audit/service';
import slugify from 'slugify';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const createPropertyTypeSchema = z.object({
  name: z.string().min(1).max(200),
  parentId: z.string().nullable().optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updatePropertyTypeSchema = createPropertyTypeSchema.partial();

export type CreatePropertyTypeInput = z.infer<typeof createPropertyTypeSchema>;
export type UpdatePropertyTypeInput = z.infer<typeof updatePropertyTypeSchema>;

// ─── Service ─────────────────────────────────────────────────────────────────

export class PropertyTypeService {
  /**
   * Creates a new property type.
   */
  static async create(input: CreatePropertyTypeInput, adminId: string) {
    const slug = slugify(input.name, { lower: true, strict: true });

    // Check uniqueness
    const existing = await prisma.propertyType.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictError(`Property type '${input.name}' already exists`);
    }

    // Verify parent exists if specified
    if (input.parentId) {
      const parent = await prisma.propertyType.findUnique({
        where: { id: input.parentId, deletedAt: null },
      });
      if (!parent) {
        throw new NotFoundError('Parent PropertyType', input.parentId);
      }
    }

    const propertyType = await prisma.propertyType.create({
      data: {
        name: input.name,
        slug,
        parentId: input.parentId || null,
        description: input.description,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
      },
    });

    await AuditService.log({
      adminId,
      action: 'PROPERTY_TYPE_CREATED',
      entityType: 'PropertyType',
      entityId: propertyType.id,
      metadata: { name: propertyType.name },
    });

    return propertyType;
  }

  /**
   * Updates a property type.
   */
  static async update(id: string, input: UpdatePropertyTypeInput, adminId: string) {
    const existing = await prisma.propertyType.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('PropertyType', id);
    }

    const data: Prisma.PropertyTypeUpdateInput = {};

    if (input.name !== undefined) {
      data.name = input.name;
      data.slug = slugify(input.name, { lower: true, strict: true });

      // Check slug uniqueness
      const slugExists = await prisma.propertyType.findFirst({
        where: { slug: data.slug as string, id: { not: id } },
      });
      if (slugExists) {
        throw new ConflictError(`Property type '${input.name}' already exists`);
      }
    }

    if (input.parentId !== undefined) data.parent = input.parentId ? { connect: { id: input.parentId } } : { disconnect: true };
    if (input.description !== undefined) data.description = input.description;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    const propertyType = await prisma.propertyType.update({
      where: { id },
      data,
    });

    await AuditService.log({
      adminId,
      action: 'PROPERTY_TYPE_UPDATED',
      entityType: 'PropertyType',
      entityId: id,
      metadata: { changedFields: Object.keys(input) },
    });

    return propertyType;
  }

  /**
   * Soft-deletes a property type.
   */
  static async delete(id: string, adminId: string) {
    const existing = await prisma.propertyType.findUnique({
      where: { id, deletedAt: null },
      include: { children: true },
    });

    if (!existing) {
      throw new NotFoundError('PropertyType', id);
    }

    // Check for child types
    if (existing.children.length > 0) {
      throw new ConflictError('Cannot delete property type with child types');
    }

    // Check for properties using this type
    const propertyCount = await prisma.property.count({
      where: { propertyTypeId: id, deletedAt: null },
    });

    if (propertyCount > 0) {
      throw new ConflictError(
        `Cannot delete property type with ${propertyCount} active properties`
      );
    }

    await prisma.propertyType.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await AuditService.log({
      adminId,
      action: 'PROPERTY_TYPE_DELETED',
      entityType: 'PropertyType',
      entityId: id,
    });
  }

  /**
   * Lists all property types as a hierarchical tree.
   */
  static async listAll(includeInactive = false) {
    const where: Prisma.PropertyTypeWhereInput = {
      deletedAt: null,
      ...(!includeInactive && { isActive: true }),
    };

    return prisma.propertyType.findMany({
      where,
      include: {
        children: {
          where,
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Lists active root-level property types with children (public).
   */
  static async listPublic() {
    return prisma.propertyType.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        children: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            sortOrder: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
