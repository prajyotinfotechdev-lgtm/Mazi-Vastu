// ─── Admin Media API ────────────────────────────────────────────────────────
// POST /api/admin/media/upload — request signed upload params
// POST /api/admin/media/confirm — confirm upload and create record
// DELETE /api/admin/media/[id] — delete media
// Access: ADMIN only
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { MediaService, requestUploadSchema, confirmUploadSchema } from '@/modules/media/service';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const body = await request.json();

    if (action === 'confirm') {
      const input = confirmUploadSchema.parse(body);
      const media = await MediaService.confirmUpload(input);
      return NextResponse.json(media, { status: 201 });
    }

    // Default: request upload params
    const input = requestUploadSchema.parse(body);
    const params = await MediaService.requestUpload(input);
    return NextResponse.json(params);
  } catch (error) {
    return handleApiError(error);
  }
}
