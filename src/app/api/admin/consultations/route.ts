// ─── Admin Consultations API ────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { ConsultationService, consultationFilterSchema } from '@/modules/consultations/service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filters = consultationFilterSchema.parse(searchParams);
    const result = await ConsultationService.list(filters);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
