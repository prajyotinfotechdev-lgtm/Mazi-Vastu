import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { LeadService, createLeadSchema } from '@/modules/leads/service';
import { standardRateLimiter, getRateLimitKey } from '@/lib/security/rate-limiter';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const key = getRateLimitKey(request, 'public-register');
    await standardRateLimiter.consume(key);

    const body = await request.json();
    
    // Create the lead
    const input = createLeadSchema.parse({
      name: body.name,
      phone: body.phone,
      email: body.email || undefined,
      source: 'PROPERTY_INTEREST',
      propertyId: body.propertyId,
    });
    
    const lead = await LeadService.create(input);

    // Set the cookie
    const visitorInfo = {
      name: body.name,
      phone: body.phone,
      email: body.email || '',
    };

    cookies().set('visitor_info', JSON.stringify(visitorInfo), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully registered.',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
