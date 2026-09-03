// ─── Admin Property Publish API ─────────────────────────────────────────────
// POST /api/admin/properties/[id]/publish — publish a property
// Access: ADMIN only
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { PropertyService } from '@/modules/properties/service';
import { NotificationService } from '@/modules/notifications/service';
import { serializeAdminProperty } from '@/modules/properties/serializers';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();

    // Publish (transactional: validate + update + audit + outbox)
    const property = await PropertyService.publish(params.id, admin.id);

    // Trigger notification processing (async, non-blocking)
    // Push failure does NOT roll back property publication
    NotificationService.triggerProcessing().catch(() => {
      // Intentionally swallowed — notifications are non-critical
    });

    const serialized = await serializeAdminProperty(property);

    return NextResponse.json(serialized);
  } catch (error) {
    return handleApiError(error);
  }
}
