// ─── Leads Service ──────────────────────────────────────────────────────────
// Captures and manages all lead types: registration, consultation,
// service contact, and property interest.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { NotFoundError } from '@/lib/errors';
import { createPaginatedResponse, type PaginatedResponse } from '@/lib/validation/schemas';
import { z } from 'zod';
import type { Lead, LeadSource, LeadStatus, Prisma } from '@prisma/client';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const createLeadSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(1).max(20),
  email: z.string().email().optional(),
  source: z.enum(['REGISTRATION', 'CONSULTATION', 'SERVICE_CONTACT', 'PROPERTY_INTEREST']),
  propertyId: z.string().optional(),
  serviceId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  visitorId: z.string().optional(),
});

export const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED', 'REJECTED']).optional(),
  notes: z.string().max(5000).optional(),
});

export const leadFilterSchema = z.object({
  source: z.enum(['REGISTRATION', 'CONSULTATION', 'SERVICE_CONTACT', 'PROPERTY_INTEREST']).optional(),
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED', 'REJECTED']).optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFilterInput = z.infer<typeof leadFilterSchema>;

// ─── Service ─────────────────────────────────────────────────────────────────

export class LeadService {
  /**
   * Creates a new lead.
   */
  static async create(input: CreateLeadInput): Promise<Lead> {
    return prisma.lead.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        source: input.source,
        status: 'NEW',
        propertyId: input.propertyId,
        serviceId: input.serviceId,
        metadata: input.metadata || {},
        visitorId: input.visitorId,
      },
    });
  }

  /**
   * Gets a lead by ID (admin).
   */
  static async getById(id: string): Promise<Lead> {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        visitor: {
          select: { id: true, name: true, mobile: true, email: true },
        },
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead', id);
    }

    return lead;
  }

  /**
   * Updates a lead (status, notes).
   */
  static async update(id: string, input: UpdateLeadInput): Promise<Lead> {
    const existing = await prisma.lead.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError('Lead', id);
    }

    return prisma.lead.update({
      where: { id },
      data: {
        ...(input.status && { status: input.status }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });
  }

  /**
   * Lists leads with filtering and pagination (admin).
   */
  static async list(
    filters: LeadFilterInput
  ): Promise<PaginatedResponse<Lead>> {
    const { page, pageSize, source, status, q } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.LeadWhereInput = {
      ...(source && { source }),
      ...(status && { status }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          visitor: {
            select: { id: true, name: true, mobile: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.lead.count({ where }),
    ]);

    return createPaginatedResponse(leads, total, page, pageSize);
  }
}
