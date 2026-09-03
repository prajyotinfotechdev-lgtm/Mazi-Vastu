// ─── Health Check ───────────────────────────────────────────────────────────
// Verifies database connectivity. Never exposes credentials or internals.
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      { status: 'ok', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Service unavailable' },
      { status: 503 }
    );
  }
}
