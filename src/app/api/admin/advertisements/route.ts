// ─── Admin Advertisements API ───────────────────────────────────────────────
// GET /api/admin/advertisements — list ads
// POST /api/admin/advertisements — create ad
// Access: ADMIN only
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { AdvertisementService } from '@/modules/advertisements/service';
import { createAdvertisementSchema, advertisementFilterSchema } from '@/modules/advertisements/schemas';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filters = advertisementFilterSchema.parse(searchParams);

    const result = await AdvertisementService.list(filters);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const input = createAdvertisementSchema.parse(body);

    const ad = await AdvertisementService.create(input, admin.id);

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
