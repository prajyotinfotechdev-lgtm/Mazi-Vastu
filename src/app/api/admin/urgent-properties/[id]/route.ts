import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { requireAdmin } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;
    const body = await request.json();

    const existing = await prisma.urgentProperty.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Urgent property not found' }, { status: 404 });
    }

    const updated = await prisma.urgentProperty.update({
      where: { id },
      data: {
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
        title: body.title !== undefined ? String(body.title).trim() : existing.title,
        location: body.location !== undefined ? String(body.location).trim() : existing.location,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    const existing = await prisma.urgentProperty.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Urgent property not found' }, { status: 404 });
    }

    await prisma.urgentProperty.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
