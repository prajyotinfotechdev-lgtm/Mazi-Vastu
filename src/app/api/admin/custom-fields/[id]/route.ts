// ─── Admin Custom Field Detail API ──────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { CustomFieldService, updateFieldDefinitionSchema } from '@/modules/custom-fields/service';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const input = updateFieldDefinitionSchema.parse(body);
    const field = await CustomFieldService.update(params.id, input, admin.id);
    return NextResponse.json(field);
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
    await CustomFieldService.delete(params.id, admin.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
