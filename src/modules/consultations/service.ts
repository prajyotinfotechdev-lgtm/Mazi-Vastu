// ─── Consultation Service ───────────────────────────────────────────────────
// Dedicated consultation/property-hunting request model.
// Every valid submission reaches the Admin dashboard.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { NotFoundError } from '@/lib/errors';
import { LeadService } from '@/modules/leads/service';
import { createPaginatedResponse, type PaginatedResponse } from '@/lib/validation/schemas';
import { z } from 'zod';
import type { ConsultationRequest, Prisma } from '@prisma/client';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const createConsultationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  email: z.string().email().optional(),
  wantedPropertyType: z.string().max(200).optional(),
  wantedPropertySize: z.string().max(200).optional(),
  wantedPropertyLocation: z.string().max(500).optional(),
  budget: z.string().max(200).optional(),
});

export const updateConsultationSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED']).optional(),
  notes: z.string().max(5000).optional(),
});

export const consultationFilterSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED']).optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>;
export type ConsultationFilterInput = z.infer<typeof consultationFilterSchema>;

// ─── Service ─────────────────────────────────────────────────────────────────

export class ConsultationService {
  /**
   * Creates a consultation request and a corresponding lead.
   */
  static async create(input: CreateConsultationInput): Promise<ConsultationRequest> {
    // Create consultation request
    const consultation = await prisma.consultationRequest.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email,
        wantedPropertyType: input.wantedPropertyType,
        wantedPropertySize: input.wantedPropertySize,
        wantedPropertyLocation: input.wantedPropertyLocation,
        budget: input.budget,
        status: 'NEW',
      },
    });

    // Also create a lead for the Admin dashboard
    await LeadService.create({
      name: input.name,
      phone: input.phone,
      email: input.email,
      source: 'CONSULTATION',
      metadata: {
        consultationId: consultation.id,
        wantedPropertyType: input.wantedPropertyType,
        wantedPropertyLocation: input.wantedPropertyLocation,
        budget: input.budget,
      },
    });

    return consultation;
  }

  /**
   * Gets a consultation request by ID (admin).
   */
  static async getById(id: string): Promise<ConsultationRequest> {
    const consultation = await prisma.consultationRequest.findUnique({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundError('ConsultationRequest', id);
    }

    return consultation;
  }

  /**
   * Updates a consultation request (admin).
   */
  static async update(id: string, input: UpdateConsultationInput): Promise<ConsultationRequest> {
    const existing = await prisma.consultationRequest.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundError('ConsultationRequest', id);
    }

    return prisma.consultationRequest.update({
      where: { id },
      data: {
        ...(input.status && { status: input.status }),
        ...(input.notes !== undefined && { notes: input.notes }),
      },
    });
  }

  /**
   * Lists consultation requests (admin).
   */
  static async list(
    filters: ConsultationFilterInput
  ): Promise<PaginatedResponse<ConsultationRequest>> {
    const { page, pageSize, status, q } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ConsultationRequestWhereInput = {
      ...(status && { status }),
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q } },
          { email: { contains: q, mode: 'insensitive' } },
          { wantedPropertyLocation: { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [consultations, total] = await Promise.all([
      prisma.consultationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.consultationRequest.count({ where }),
    ]);

    return createPaginatedResponse(consultations, total, page, pageSize);
  }
}
