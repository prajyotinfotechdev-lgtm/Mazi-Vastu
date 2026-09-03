// ─── Public Registration API ────────────────────────────────────────────────
// POST /api/public/register — visitor registration
// Access: PUBLIC
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { VisitorService, registerVisitorSchema } from '@/modules/visitors/service';
import { LeadService } from '@/modules/leads/service';
import { strictRateLimiter, getRateLimitKey } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Strict rate limit for registration
    const key = getRateLimitKey(request, 'register');
    await strictRateLimiter.consume(key);

    const body = await request.json();
    const input = registerVisitorSchema.parse(body);

    const result = await VisitorService.register(input);

    // Create a registration lead
    if (result.visitor.isNew) {
      await LeadService.create({
        name: input.name,
        phone: input.mobile,
        email: input.email,
        source: 'REGISTRATION',
        visitorId: result.visitor.id,
      });
    }

    return NextResponse.json(
      {
        success: true,
        visitor: {
          id: result.visitor.id,
          name: result.visitor.name,
          isNew: result.visitor.isNew,
        },
      },
      { status: result.visitor.isNew ? 201 : 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
