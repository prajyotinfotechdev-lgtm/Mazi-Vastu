// ─── Admin Lead Detail API ──────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { LeadService, updateLeadSchema } from '@/modules/leads/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const lead = await LeadService.getById(params.id);
    return NextResponse.json(lead);
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
    const input = updateLeadSchema.parse(body);
    const lead = await LeadService.update(params.id, input);
    return NextResponse.json(lead);
  } catch (error) {
    return handleApiError(error);
  }
}
