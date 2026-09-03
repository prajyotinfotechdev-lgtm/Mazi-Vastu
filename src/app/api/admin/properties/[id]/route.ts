// ─── Admin Property Detail API ──────────────────────────────────────────────
// GET /api/admin/properties/[id] — get property detail
// PUT /api/admin/properties/[id] — update property
// DELETE /api/admin/properties/[id] — archive/soft-delete property
// Access: ADMIN only
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { PropertyService } from '@/modules/properties/service';
import { updatePropertySchema } from '@/modules/properties/schemas';
import { serializeAdminProperty } from '@/modules/properties/serializers';
import { sendPushNotificationToAllCustomers } from '@/lib/push';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const property = await PropertyService.getById(params.id);
    const serialized = await serializeAdminProperty(property);

    return NextResponse.json(serialized);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const input = updatePropertySchema.parse(body);

    const oldProperty = await PropertyService.getById(params.id);
    const property = await PropertyService.update(params.id, input, admin.id);
    const serialized = await serializeAdminProperty(property);

    if (oldProperty.status !== 'PUBLISHED' && property.status === 'PUBLISHED') {
      sendPushNotificationToAllCustomers({
        title: '🚨 New Property Alert!',
        body: `A new ${property.type} was just listed in ${property.city}. Click here to see it before anyone else!`,
        url: `/properties/${property.slug || property.id}`
      }).catch(err => console.error("Push Error: ", err));
    }

    return NextResponse.json(serialized);
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

    await PropertyService.archive(params.id, admin.id);

    return NextResponse.json({ success: true, message: 'Property archived' });
  } catch (error) {
    return handleApiError(error);
  }
}
