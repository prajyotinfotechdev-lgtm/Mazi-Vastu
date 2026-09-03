// ─── Admin Audit Logs API ───────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { AuditService } from '@/modules/audit/service';
import { z } from 'zod';

const auditFilterSchema = z.object({
  adminId: z.string().optional(),
  action: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filters = auditFilterSchema.parse(searchParams);

    const result = await AuditService.list(filters);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
