// ─── Admin Leads API ────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { LeadService, leadFilterSchema } from '@/modules/leads/service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filters = leadFilterSchema.parse(searchParams);
    const result = await LeadService.list(filters);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
