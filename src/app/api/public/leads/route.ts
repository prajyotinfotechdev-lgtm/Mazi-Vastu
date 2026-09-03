import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { LeadService, createLeadSchema } from '@/modules/leads/service';
import { standardRateLimiter, getRateLimitKey } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const key = getRateLimitKey(request, 'public-leads');
    await standardRateLimiter.consume(key);

    const body = await request.json();
    
    // Map the generic referenceId to the appropriate specific ID based on source
    let mappedBody = { ...body };
    if (body.source === 'PROPERTY_INQUIRY' || body.source === 'PROPERTY_INTEREST') {
      mappedBody.source = 'PROPERTY_INTEREST';
      mappedBody.propertyId = body.referenceId;
    } else if (body.source === 'SERVICE_CONTACT') {
      mappedBody.serviceId = body.referenceId;
    }

    // Map message to metadata
    if (body.message) {
      mappedBody.metadata = { message: body.message };
    }

    // Allow empty email instead of failing validation
    if (mappedBody.email === '') {
      delete mappedBody.email;
    }

    const input = createLeadSchema.parse(mappedBody);
    const lead = await LeadService.create(input);

    return NextResponse.json(
      {
        success: true,
        leadId: lead.id,
        message: 'Your inquiry has been submitted successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
