// ─── Health Check ───────────────────────────────────────────────────────────
// Server liveness probe — always returns 200 so Railway healthcheck passes.
// DB connectivity is checked separately and reported as a field (not a failure).
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'ok';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'unavailable';
  }

  // Always return 200 — this is a liveness probe, not a readiness probe.
  // Railway healthcheck must pass for the container to be considered healthy.
  return NextResponse.json(
    {
      status: 'ok',
      db: dbStatus,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
