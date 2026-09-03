// ─── Custom Fields Service ──────────────────────────────────────────────────
// CRUD for PropertyFieldDefinition — admin-configurable dynamic fields.
// No code changes or migrations needed to add new property fields.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors';
import { AuditService } from '@/modules/audit/service';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const createFieldDefinitionSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z][a-zA-Z0-9_]*$/, 'Key must be camelCase, starting with lowercase'),
  label: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  dataType: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'DATE']),
  options: z.array(z.string()).optional(),
  validationRules: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
    })
    .optional(),
  isRequired: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  isGated: z.boolean().default(false),
  isFilterable: z.boolean().default(false),
  isSearchable: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateFieldDefinitionSchema = createFieldDefinitionSchema
  .omit({ key: true }) // Key cannot be changed after creation
  .partial();

export type CreateFieldDefinitionInput = z.infer<typeof createFieldDefinitionSchema>;
export type UpdateFieldDefinitionInput = z.infer<typeof updateFieldDefinitionSchema>;

// ─── Service ─────────────────────────────────────────────────────────────────

export class CustomFieldService {
  /**
   * Creates a new field definition.
   */
  static async create(input: CreateFieldDefinitionInput, adminId: string) {
    // Validate: SELECT/MULTI_SELECT must have options
    if (
      (input.dataType === 'SELECT' || input.dataType === 'MULTI_SELECT') &&
      (!input.options || input.options.length === 0)
    ) {
      throw new ValidationError(
        `'${input.dataType}' fields must have at least one option`
      );
    }

    // Check uniqueness
    const existing = await prisma.propertyFieldDefinition.findUnique({
      where: { key: input.key },
    });
    if (existing) {
      throw new ConflictError(`Field key '${input.key}' already exists`);
    }

    // A field cannot be both public and gated simultaneously
    // (gated means: visible only to registered users, not public)
    // isPublic=true + isGated=true means: visible to public BUT full info gated
    // This is valid — the field label shows but value is hidden for anonymous

    const field = await prisma.propertyFieldDefinition.create({
      data: {
        key: input.key,
        label: input.label,
        description: input.description,
        dataType: input.dataType,
        options: input.options || [],
        validationRules: input.validationRules || {},
        isRequired: input.isRequired,
        isPublic: input.isPublic,
        isGated: input.isGated,
        isFilterable: input.isFilterable,
        isSearchable: input.isSearchable,
        isActive: input.isActive,
        sortOrder: input.sortOrder,
      },
    });

    await AuditService.log({
      adminId,
      action: 'CUSTOM_FIELD_CREATED',
      entityType: 'PropertyFieldDefinition',
      entityId: field.id,
      metadata: { key: field.key, dataType: field.dataType },
    });

    return field;
  }

  /**
   * Updates a field definition.
   */
  static async update(
    id: string,
    input: UpdateFieldDefinitionInput,
    adminId: string
  ) {
    const existing = await prisma.propertyFieldDefinition.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('PropertyFieldDefinition', id);
    }

    // Validate options for SELECT types
    const newDataType = input.dataType || existing.dataType;
    if (
      (newDataType === 'SELECT' || newDataType === 'MULTI_SELECT') &&
      input.options !== undefined &&
      input.options.length === 0
    ) {
      throw new ValidationError(
        `'${newDataType}' fields must have at least one option`
      );
    }

    const data: Prisma.PropertyFieldDefinitionUpdateInput = {};
    if (input.label !== undefined) data.label = input.label;
    if (input.description !== undefined) data.description = input.description;
    if (input.dataType !== undefined) data.dataType = input.dataType;
    if (input.options !== undefined) data.options = input.options;
    if (input.validationRules !== undefined) data.validationRules = input.validationRules;
    if (input.isRequired !== undefined) data.isRequired = input.isRequired;
    if (input.isPublic !== undefined) data.isPublic = input.isPublic;
    if (input.isGated !== undefined) data.isGated = input.isGated;
    if (input.isFilterable !== undefined) data.isFilterable = input.isFilterable;
    if (input.isSearchable !== undefined) data.isSearchable = input.isSearchable;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    const field = await prisma.propertyFieldDefinition.update({
      where: { id },
      data,
    });

    await AuditService.log({
      adminId,
      action: 'CUSTOM_FIELD_UPDATED',
      entityType: 'PropertyFieldDefinition',
      entityId: id,
      metadata: { changedFields: Object.keys(input) },
    });

    return field;
  }

  /**
   * Soft-deletes a field definition.
   */
  static async delete(id: string, adminId: string) {
    const existing = await prisma.propertyFieldDefinition.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('PropertyFieldDefinition', id);
    }

    await prisma.propertyFieldDefinition.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await AuditService.log({
      adminId,
      action: 'CUSTOM_FIELD_DELETED',
      entityType: 'PropertyFieldDefinition',
      entityId: id,
    });
  }

  /**
   * Lists all field definitions (admin).
   */
  static async listAll(includeInactive = false) {
    return prisma.propertyFieldDefinition.findMany({
      where: {
        deletedAt: null,
        ...(!includeInactive && { isActive: true }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Lists public field definitions (for filters/display).
   */
  static async listPublic() {
    return prisma.propertyFieldDefinition.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        isPublic: true,
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        key: true,
        label: true,
        description: true,
        dataType: true,
        options: true,
        isFilterable: true,
        isGated: true,
        sortOrder: true,
      },
    });
  }
}
