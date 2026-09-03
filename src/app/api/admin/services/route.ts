// ─── Admin Services API ─────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { AlliedServiceService, createServiceSchema } from '@/modules/services/service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const services = await AlliedServiceService.listAll(true);
    return NextResponse.json({ items: services });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const input = createServiceSchema.parse(body);
    const service = await AlliedServiceService.create(input, admin.id);
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
