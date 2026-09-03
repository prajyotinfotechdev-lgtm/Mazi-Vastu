// ─── Admin Property Type Detail API ─────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { PropertyTypeService, updatePropertyTypeSchema } from '@/modules/property-types/service';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const input = updatePropertyTypeSchema.parse(body);
    const type = await PropertyTypeService.update(params.id, input, admin.id);
    return NextResponse.json(type);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    await PropertyTypeService.delete(params.id, admin.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
