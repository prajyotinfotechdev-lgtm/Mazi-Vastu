// ─── Public Consultation API ────────────────────────────────────────────────
// POST /api/public/consultation — submit consultation request
// Access: PUBLIC
// ──────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors/handler';
import { ConsultationService, createConsultationSchema } from '@/modules/consultations/service';
import { standardRateLimiter, getRateLimitKey } from '@/lib/security/rate-limiter';
import { sendPushNotificationToAllAdmins } from '@/lib/push';

export async function POST(request: NextRequest) {
  try {
    const key = getRateLimitKey(request, 'consultation');
    await standardRateLimiter.consume(key);

    const body = await request.json();
    const input = createConsultationSchema.parse(body);

    const consultation = await ConsultationService.create(input);

    // Trigger Push Notification asynchronously (don't await)
    sendPushNotificationToAllAdmins({
      title: 'New Lead Received!',
      body: `${input.name} has submitted a consultation request.`,
      url: '/admin/leads'
    }).catch(err => console.error("Push Error: ", err));

    return NextResponse.json(
      {
        success: true,
        consultationId: consultation.id,
        message: 'Your consultation request has been submitted successfully.',
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
