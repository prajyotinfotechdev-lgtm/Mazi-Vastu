// POST /api/admin/advertisements/[id]/deactivate
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { AdvertisementService } from '@/modules/advertisements/service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const ad = await AdvertisementService.deactivate(params.id, admin.id);
    return NextResponse.json(ad);
  } catch (error) {
    return handleApiError(error);
  }
}
