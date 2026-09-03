// ─── Allied Services Service ────────────────────────────────────────────────
// CRUD for allied services + WhatsApp deep link generation.
// Contact clicks are tracked as leads.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/errors';
import { AuditService } from '@/modules/audit/service';
import { LeadService } from '@/modules/leads/service';
import { createPaginatedResponse, type PaginatedResponse } from '@/lib/validation/schemas';
import slugify from 'slugify';
import { z } from 'zod';
import type { AlliedService, Prisma } from '@prisma/client';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const createServiceSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  iconUrl: z.string().url().optional().nullable(),
  price: z.number().min(0).optional(),
  priceUnit: z.string().max(50).optional(),
  whatsappNumber: z.string().regex(/^\d{10,15}$/, 'Invalid WhatsApp number'),
  whatsappMessageTemplate: z
    .string()
    .max(500)
    .default('Hello, I am interested in the {serviceName} service from MaziVastu.'),
  providerContacts: z.array(
    z.object({
      name: z.string().min(1, 'Name is required'),
      number: z.string().min(1, 'Number is required')
    })
  ).optional().default([]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

// ─── WhatsApp URL Generation ─────────────────────────────────────────────────

/**
 * Generates a validated WhatsApp deep link URL.
 * Never accepts arbitrary URLs from users.
 */
export function generateWhatsAppUrl(
  phoneNumber: string,
  messageTemplate: string,
  context: { serviceName: string; price?: number | null; priceUnit?: string | null; userName?: string }
): string {
  // Validate phone number format
  if (!/^\d{10,15}$/.test(phoneNumber)) {
    throw new ValidationError('Invalid WhatsApp number format');
  }

  const priceStr = context.price ? `₹${context.price}${context.priceUnit ? ` ${context.priceUnit}` : ''}` : 'N/A';

  // Fill template
  let message = messageTemplate.replace(/\{serviceName\}/g, context.serviceName);
  message = message.replace(/\{price\}/g, priceStr);
  message = message.replace(/\{userName\}/g, context.userName || 'a customer');

  // Encode and generate wa.me URL
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class AlliedServiceService {
  /**
   * Creates a new allied service.
   */
  static async create(input: CreateServiceInput, adminId: string) {
    const slug = slugify(input.name, { lower: true, strict: true });

    const existing = await prisma.alliedService.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictError(`Service '${input.name}' already exists`);
    }

    const service = await prisma.alliedService.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        iconUrl: input.iconUrl,
        price: input.price,
        priceUnit: input.priceUnit,
        whatsappNumber: input.whatsappNumber,
        whatsappMessageTemplate: input.whatsappMessageTemplate,
        providerContacts: input.providerContacts || [],
        isActive: input.isActive,
        sortOrder: input.sortOrder,
      },
    });

    await AuditService.log({
      adminId,
      action: 'SERVICE_CREATED',
      entityType: 'AlliedService',
      entityId: service.id,
      metadata: { name: service.name },
    });

    return service;
  }

  /**
   * Updates an allied service.
   */
  static async update(id: string, input: UpdateServiceInput, adminId: string) {
    const existing = await prisma.alliedService.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('AlliedService', id);
    }

    const data: Prisma.AlliedServiceUpdateInput = {};
    if (input.name !== undefined) {
      data.name = input.name;
      data.slug = slugify(input.name, { lower: true, strict: true });
    }
    if (input.description !== undefined) data.description = input.description;
    if (input.iconUrl !== undefined) data.iconUrl = input.iconUrl;
    if (input.price !== undefined) data.price = input.price;
    if (input.priceUnit !== undefined) data.priceUnit = input.priceUnit;
    if (input.whatsappNumber !== undefined) data.whatsappNumber = input.whatsappNumber;
    if (input.whatsappMessageTemplate !== undefined)
      data.whatsappMessageTemplate = input.whatsappMessageTemplate;
    if (input.providerContacts !== undefined) data.providerContacts = input.providerContacts;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    const service = await prisma.alliedService.update({
      where: { id },
      data,
    });

    await AuditService.log({
      adminId,
      action: 'SERVICE_UPDATED',
      entityType: 'AlliedService',
      entityId: id,
      metadata: { changedFields: Object.keys(input) },
    });

    return service;
  }

  /**
   * Soft-deletes a service.
   */
  static async delete(id: string, adminId: string) {
    const existing = await prisma.alliedService.findUnique({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('AlliedService', id);
    }

    await prisma.alliedService.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await AuditService.log({
      adminId,
      action: 'SERVICE_DELETED',
      entityType: 'AlliedService',
      entityId: id,
    });
  }

  /**
   * Lists all services (admin).
   */
  static async listAll(includeInactive = false): Promise<AlliedService[]> {
    return prisma.alliedService.findMany({
      where: {
        deletedAt: null,
        ...(!includeInactive && { isActive: true }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Lists active services (public).
   */
  static async listPublic() {
    const services = await prisma.alliedService.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconUrl: true,
        price: true,
        priceUnit: true,
        whatsappNumber: true,
        whatsappMessageTemplate: true,
        providerContacts: true,
        sortOrder: true,
      },
    });

    return services;
  }

  /**
   * Tracks a service contact click and returns the WhatsApp URL.
   * Creates a lead for the admin dashboard.
   */
  static async trackContact(
    serviceId: string,
    contactInfo: { name?: string; phone?: string; visitorId?: string }
  ): Promise<{ whatsappUrl: string }> {
    const service = await prisma.alliedService.findUnique({
      where: { id: serviceId, isActive: true, deletedAt: null },
    });

    if (!service) {
      throw new NotFoundError('AlliedService', serviceId);
    }

    // Generate WhatsApp URL (validated, not user-supplied)
    const whatsappUrl = generateWhatsAppUrl(
      service.whatsappNumber,
      service.whatsappMessageTemplate,
      {
        serviceName: service.name,
        price: service.price,
        priceUnit: service.priceUnit,
        userName: contactInfo.name
      }
    );

    // Track as lead
    await LeadService.create({
      name: contactInfo.name || 'Anonymous',
      phone: contactInfo.phone || 'Unknown',
      source: 'SERVICE_CONTACT',
      serviceId: service.id,
      visitorId: contactInfo.visitorId,
      metadata: { serviceName: service.name, serviceSlug: service.slug },
    });

    return { whatsappUrl };
  }
}
