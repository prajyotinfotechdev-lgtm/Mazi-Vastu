// ─── Admin Properties API ───────────────────────────────────────────────────
// GET /api/admin/properties — list properties (admin)
// POST /api/admin/properties — create property
// Access: ADMIN only
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { PropertyService } from '@/modules/properties/service';
import { createPropertySchema, propertyFilterSchema } from '@/modules/properties/schemas';
import { serializeAdminProperty } from '@/modules/properties/serializers';
import { NotificationService } from '@/modules/notifications/service';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filters = propertyFilterSchema.parse(searchParams);

    const result = await PropertyService.list(filters);

    const serializedItems = await Promise.all(
      (result.items as any[]).map((p) => serializeAdminProperty(p))
    );

    return NextResponse.json({
      items: serializedItems,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const input = createPropertySchema.parse(body);

    const property = await PropertyService.create(input, admin.id);
    const serialized = await serializeAdminProperty(property);

    if (property.status === 'PUBLISHED') {
      NotificationService.triggerProcessing().catch(() => {});
    }

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
