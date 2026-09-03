// ─── Admin Ad Activate/Deactivate/Placements ────────────────────────────────
// POST /api/admin/advertisements/[id]/activate
// POST /api/admin/advertisements/[id]/deactivate
// PUT  /api/admin/advertisements/[id]/placements
// Access: ADMIN only
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { AdvertisementService } from '@/modules/advertisements/service';
import { advertisementPlacementSchema } from '@/modules/advertisements/schemas';

// POST /api/admin/advertisements/[id]/activate
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();

    // Determine action from URL path
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const action = pathSegments[pathSegments.length - 1];

    if (action === 'activate') {
      const ad = await AdvertisementService.activate(params.id, admin.id);
      return NextResponse.json(ad);
    } else if (action === 'deactivate') {
      const ad = await AdvertisementService.deactivate(params.id, admin.id);
      return NextResponse.json(ad);
    }

    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Unknown action' } },
      { status: 404 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
