// ─── Public Properties API ──────────────────────────────────────────────────
// GET /api/public/properties — list published properties with filtering
// Access: PUBLIC (anonymous)
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { PropertyService } from '@/modules/properties/service';
import { publicPropertyFilterSchema } from '@/modules/properties/schemas';
import { serializePublicProperty, serializeRegisteredProperty } from '@/modules/properties/serializers';
import { getVisitorSession } from '@/lib/auth/middleware';
import { relaxedRateLimiter, getRateLimitKey } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const key = getRateLimitKey(request, 'public-properties');
    await relaxedRateLimiter.consume(key);

    // Parse query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filters = publicPropertyFilterSchema.parse(searchParams);

    // Get properties
    const result = await PropertyService.listPublished(filters);

    // Check visitor session for access level
    const visitor = await getVisitorSession();

    // Serialize based on access level
    const serializer = visitor
      ? serializeRegisteredProperty
      : serializePublicProperty;

    const serializedItems = await Promise.all(
      (result.items as any[]).map((p) => serializer(p))
    );

    return NextResponse.json({
      items: serializedItems,
      pagination: result.pagination,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
