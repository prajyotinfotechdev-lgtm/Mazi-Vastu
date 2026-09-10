import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const urgentProperties = await prisma.urgentProperty.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ items: urgentProperties });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { title, location } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title / details are required' }, { status: 400 });
    }
    if (!location || typeof location !== 'string' || !location.trim()) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    const urgentProperty = await prisma.urgentProperty.create({
      data: {
        title: title.trim(),
        location: location.trim(),
        isActive: true,
      },
    });

    return NextResponse.json(urgentProperty, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
