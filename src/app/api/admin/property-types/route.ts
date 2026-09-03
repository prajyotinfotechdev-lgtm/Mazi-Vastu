// ─── Admin Property Types API ───────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { PropertyTypeService, createPropertyTypeSchema } from '@/modules/property-types/service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const types = await PropertyTypeService.listAll(true);
    return NextResponse.json({ items: types });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const input = createPropertyTypeSchema.parse(body);
    const type = await PropertyTypeService.create(input, admin.id);
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
