// ─── Public Advertisements API ──────────────────────────────────────────────
// GET /api/public/advertisements — list currently eligible ads
// Access: PUBLIC
// Only returns: status=ACTIVE, now >= startDate, now <= endDate, not deleted
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { AdvertisementService } from '@/modules/advertisements/service';
import { publicAdvertisementFilterSchema } from '@/modules/advertisements/schemas';

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filters = publicAdvertisementFilterSchema.parse(searchParams);

    const result = await AdvertisementService.listPublic(filters);

    // Serialize — strip admin-only data
    const serializedItems = (result.items as any[]).map((ad) =>
      AdvertisementService.serializePublic(ad)
    );

    return NextResponse.json({
      items: serializedItems,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
