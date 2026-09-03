// ─── Public Property Detail API ─────────────────────────────────────────────
// GET /api/public/properties/[slug] — get published property by slug
// Access: PUBLIC (anonymous) / REGISTERED (gated fields)
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { PropertyService } from '@/modules/properties/service';
import { serializePublicProperty, serializeRegisteredProperty } from '@/modules/properties/serializers';
import { getVisitorSession } from '@/lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { property, redirect } = await PropertyService.getBySlug(params.slug);

    // Handle slug redirect
    if (redirect) {
      return NextResponse.json(
        { redirect: `/properties/${redirect}` },
        { status: 301 }
      );
    }

    // Check visitor session
    const visitor = await getVisitorSession();

    // Serialize based on access level
    const serialized = visitor
      ? await serializeRegisteredProperty(property)
      : await serializePublicProperty(property);

    return NextResponse.json(serialized);
  } catch (error) {
    return handleApiError(error);
  }
}
