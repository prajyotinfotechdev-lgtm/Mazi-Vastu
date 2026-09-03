// ─── Audit Service ──────────────────────────────────────────────────────────
// Records admin actions for accountability and compliance.
// Never stores secrets or unnecessary sensitive data.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { createPaginatedResponse, type PaginatedResponse } from '@/lib/validation/schemas';
import type { AuditLog, Prisma } from '@prisma/client';

interface AuditLogInput {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Creates an audit log entry.
   * Non-throwing — audit failures should not break business operations.
   */
  static async log(input: AuditLogInput): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          adminId: input.adminId,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          metadata: input.metadata || {},
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        },
      });
    } catch (error) {
      // Log but don't throw — audit failure must not break operations
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Lists audit logs with filtering and pagination (admin only).
   */
  static async list(filters: {
    adminId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    page: number;
    pageSize: number;
  }): Promise<PaginatedResponse<AuditLog>> {
    const { page, pageSize, adminId, action, entityType, entityId, startDate, endDate } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AuditLogWhereInput = {
      ...(adminId && { adminId }),
      ...(action && { action }),
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          admin: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return createPaginatedResponse(logs, total, page, pageSize);
  }
}
