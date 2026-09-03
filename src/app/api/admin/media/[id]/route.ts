// ─── Admin Media Delete API ─────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { MediaService } from '@/modules/media/service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const entityType = url.searchParams.get('type') || 'property';

    if (entityType === 'advertisement') {
      await MediaService.deleteAdvertisementMedia(params.id);
    } else {
      await MediaService.deletePropertyMedia(params.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
