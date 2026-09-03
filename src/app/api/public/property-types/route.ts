// ─── Public Property Types API ──────────────────────────────────────────────
// GET /api/public/property-types — list active property types (hierarchical)
// Access: PUBLIC
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { PropertyTypeService } from '@/modules/property-types/service';

export async function GET() {
  try {
    const types = await PropertyTypeService.listPublic();
    return NextResponse.json({ items: types });
  } catch (error) {
    return handleApiError(error);
  }
}
