import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { standardRateLimiter, getRateLimitKey } from '@/lib/security/rate-limiter';

export async function POST(request: Request) {
  try {
    const key = getRateLimitKey(request, 'public-push-subscribe');
    await standardRateLimiter.consume(key);

    const subscription = await request.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: { message: 'Invalid subscription object' } }, { status: 400 });
    }

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (!existing) {
      // Save anonymous visitor subscription
      await prisma.pushSubscription.create({
        data: {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to subscribe public visitor to push notifications:', error);
    return NextResponse.json({ error: { message: 'Internal Server Error' } }, { status: 500 });
  }
}
