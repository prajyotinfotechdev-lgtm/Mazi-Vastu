// ─── Admin Consultation Detail API ──────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { ConsultationService, updateConsultationSchema } from '@/modules/consultations/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const consultation = await ConsultationService.getById(params.id);
    return NextResponse.json(consultation);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const body = await request.json();
    const input = updateConsultationSchema.parse(body);
    const consultation = await ConsultationService.update(params.id, input);
    return NextResponse.json(consultation);
  } catch (error) {
    return handleApiError(error);
  }
}
