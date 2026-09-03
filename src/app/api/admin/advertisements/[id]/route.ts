// ─── Admin Advertisement Detail API ─────────────────────────────────────────
// GET /api/admin/advertisements/[id] — get ad detail
// PUT /api/admin/advertisements/[id] — update ad
// DELETE /api/admin/advertisements/[id] — archive ad
// Access: ADMIN only
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { AdvertisementService } from '@/modules/advertisements/service';
import { updateAdvertisementSchema } from '@/modules/advertisements/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const ad = await AdvertisementService.getById(params.id);
    return NextResponse.json(ad);
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
    const input = updateAdvertisementSchema.parse(body);
    const ad = await AdvertisementService.update(params.id, input, admin.id);
    return NextResponse.json(ad);
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
    await AdvertisementService.delete(params.id, admin.id);
    return NextResponse.json({ success: true, message: 'Advertisement archived' });
  } catch (error) {
    return handleApiError(error);
  }
}
