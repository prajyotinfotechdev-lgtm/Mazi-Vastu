// ─── Push Subscription API ──────────────────────────────────────────────────
// POST /api/push/subscribe — subscribe to push notifications
// DELETE /api/push/unsubscribe — unsubscribe from push
// Access: PUBLIC
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { NotificationService, pushSubscriptionSchema } from '@/modules/notifications/service';
import { getVisitorSession } from '@/lib/auth/middleware';
import { standardRateLimiter, getRateLimitKey } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const key = getRateLimitKey(request, 'push-subscribe');
    await standardRateLimiter.consume(key);

    const body = await request.json();
    const input = pushSubscriptionSchema.parse(body);

    // Attach visitor ID if logged in
    const visitor = await getVisitorSession();
    if (visitor) {
      input.visitorId = visitor.id;
    }

    input.userAgent = request.headers.get('user-agent') || undefined;

    const subscription = await NotificationService.subscribe(input);

    return NextResponse.json(
      { success: true, subscriptionId: subscription.id },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Endpoint is required' } },
        { status: 400 }
      );
    }

    await NotificationService.unsubscribe(endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
