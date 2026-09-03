// PUT /api/admin/advertisements/[id]/placements — assign/replace placement zones
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { AdvertisementService } from '@/modules/advertisements/service';
import { advertisementPlacementSchema } from '@/modules/advertisements/schemas';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const input = advertisementPlacementSchema.parse(body);
    const ad = await AdvertisementService.updatePlacements(params.id, input, admin.id);
    return NextResponse.json(ad);
  } catch (error) {
    return handleApiError(error);
  }
}
