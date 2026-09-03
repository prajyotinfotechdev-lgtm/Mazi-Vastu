// ─── Admin Custom Fields API ────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { CustomFieldService, createFieldDefinitionSchema } from '@/modules/custom-fields/service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const fields = await CustomFieldService.listAll(true);
    return NextResponse.json({ items: fields });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const input = createFieldDefinitionSchema.parse(body);
    const field = await CustomFieldService.create(input, admin.id);
    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
