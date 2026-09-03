// ─── Visitor Service ────────────────────────────────────────────────────────
// Lightweight visitor registration with signed session cookie.
// No password auth for MVP — designed to support OTP later.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { ValidationError } from '@/lib/errors';
import { issueVisitorSession } from '@/lib/auth/middleware';
import { logger } from '@/lib/logging/logger';
import { z } from 'zod';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const registerVisitorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  email: z.string().email('Invalid email').optional(),
  language: z.enum(['en', 'mr']).default('en'),
  registrationSource: z.string().max(50).default('WEB'),
});

export type RegisterVisitorInput = z.infer<typeof registerVisitorSchema>;

// ─── Service ─────────────────────────────────────────────────────────────────

export class VisitorService {
  /**
   * Registers a new visitor or re-issues session for existing one (merge).
   * Returns session token.
   */
  static async register(input: RegisterVisitorInput): Promise<{
    visitor: { id: string; name: string; isNew: boolean };
    token: string;
  }> {
    // Check for existing visitor by mobile (dedupe)
    let visitor = await prisma.visitor.findUnique({
      where: { mobile: input.mobile },
    });

    let isNew = false;

    if (visitor) {
      // Update existing visitor
      visitor = await prisma.visitor.update({
        where: { id: visitor.id },
        data: {
          name: input.name,
          email: input.email || visitor.email,
          language: input.language,
          lastSeenAt: new Date(),
        },
      });

      logger.info('Existing visitor session re-issued', {
        visitorId: visitor.id,
      });
    } else {
      // Create new visitor
      visitor = await prisma.visitor.create({
        data: {
          name: input.name,
          mobile: input.mobile,
          email: input.email,
          language: input.language,
          registrationSource: input.registrationSource,
        },
      });

      isNew = true;

      logger.info('New visitor registered', {
        visitorId: visitor.id,
      });
    }

    // Issue signed session cookie
    const token = await issueVisitorSession(visitor);

    return {
      visitor: {
        id: visitor.id,
        name: visitor.name,
        isNew,
      },
      token,
    };
  }
}
