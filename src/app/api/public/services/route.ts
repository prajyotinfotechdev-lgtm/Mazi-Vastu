// ─── Public Services API ────────────────────────────────────────────────────
// GET /api/public/services — list active allied services
// Access: PUBLIC
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { AlliedServiceService } from '@/modules/services/service';

export async function GET() {
  try {
    const services = await AlliedServiceService.listPublic();
    return NextResponse.json({ items: services });
  } catch (error) {
    return handleApiError(error);
  }
}
