// ─── Public Advertisement Detail API ────────────────────────────────────────
// GET /api/public/advertisements/[slug] — get eligible ad by slug
// Access: PUBLIC
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { AdvertisementService } from '@/modules/advertisements/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const advertisement = await AdvertisementService.getBySlug(params.slug);
    const serialized = AdvertisementService.serializePublic(advertisement as any);

    return NextResponse.json(serialized);
  } catch (error) {
    return handleApiError(error);
  }
}
