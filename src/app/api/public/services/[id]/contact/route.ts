// ─── Service Contact API ────────────────────────────────────────────────────
// POST /api/public/services/[id]/contact — track service contact and get WhatsApp URL
// Access: PUBLIC
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { AlliedServiceService } from '@/modules/services/service';
import { getVisitorSession } from '@/lib/auth/middleware';
import { standardRateLimiter, getRateLimitKey } from '@/lib/security/rate-limiter';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const key = getRateLimitKey(request, 'service-contact');
    await standardRateLimiter.consume(key);

    const visitor = await getVisitorSession();

    let body: { name?: string; phone?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional for logged-in visitors
    }

    const result = await AlliedServiceService.trackContact(params.id, {
      name: body.name || visitor?.name,
      phone: body.phone || visitor?.mobile,
      visitorId: visitor?.id,
    });

    return NextResponse.json({ success: true, message: 'Contact captured successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
