// ─── Public Property Fields API ─────────────────────────────────────────────
// GET /api/public/property-fields — list public field definitions
// Access: PUBLIC
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { CustomFieldService } from '@/modules/custom-fields/service';

export async function GET() {
  try {
    const fields = await CustomFieldService.listPublic();
    return NextResponse.json({ items: fields });
  } catch (error) {
    return handleApiError(error);
  }
}
