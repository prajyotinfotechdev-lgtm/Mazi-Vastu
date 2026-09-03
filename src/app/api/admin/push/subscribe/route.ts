import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email }
    });

    if (!admin) {
      return NextResponse.json({ error: { message: 'Admin not found' } }, { status: 404 });
    }

    const subscription = await request.json();

    // Check if subscription already exists
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (!existing) {
      await prisma.pushSubscription.create({
        data: {
          adminId: admin.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to subscribe to push notifications:', error);
    return NextResponse.json({ error: { message: 'Internal Server Error' } }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json({ error: { message: 'Endpoint is required' } }, { status: 400 });
    }

    await prisma.pushSubscription.delete({
      where: { endpoint }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return NextResponse.json({ error: { message: 'Internal Server Error' } }, { status: 500 });
  }
}
