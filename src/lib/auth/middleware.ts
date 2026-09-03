// ─── Auth Middleware Utilities ───────────────────────────────────────────────
// Server-side helpers for verifying admin sessions and visitor identity.
// Every admin mutation MUST call requireAdmin().
// ──────────────────────────────────────────────────────────────────────────────

import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { NextRequest } from 'next/server';

// ─── Admin Auth ──────────────────────────────────────────────────────────────

export interface AdminContext {
  id: string;
  email: string;
  name: string;
}

/**
 * Verifies the request is from an authenticated, active Admin.
 * Throws UnauthorizedError or ForbiddenError on failure.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError('Admin authentication required');
  }

  // Verify admin is still active in database
  const admin = await prisma.admin.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, isActive: true },
  });

  if (!admin) {
    throw new UnauthorizedError('Admin account not found');
  }

  if (!admin.isActive) {
    throw new ForbiddenError('Admin account is deactivated');
  }

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  };
}

// ─── Visitor Session ─────────────────────────────────────────────────────────

const VISITOR_COOKIE_NAME = 'mv-visitor-session';
const VISITOR_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function getVisitorSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is required');
  return new TextEncoder().encode(secret);
}

export interface VisitorContext {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  language: string;
}

/**
 * Issues a signed JWT cookie for a registered visitor.
 * Called after successful registration.
 */
export async function issueVisitorSession(visitor: {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  language: string;
}): Promise<string> {
  const token = await new SignJWT({
    id: visitor.id,
    name: visitor.name,
    mobile: visitor.mobile,
    email: visitor.email,
    language: visitor.language,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${VISITOR_SESSION_MAX_AGE}s`)
    .sign(getVisitorSecret());

  const cookieStore = await cookies();
  cookieStore.set(VISITOR_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: VISITOR_SESSION_MAX_AGE,
    path: '/',
  });

  return token;
}

/**
 * Reads and verifies the visitor session from the cookie.
 * Returns null if no valid session exists (anonymous visitor).
 */
export async function getVisitorSession(): Promise<VisitorContext | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(VISITOR_COOKIE_NAME)?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, getVisitorSecret());

    if (!payload.id || typeof payload.id !== 'string') return null;

    // Update last seen
    await prisma.visitor.update({
      where: { id: payload.id },
      data: { lastSeenAt: new Date() },
    }).catch(() => {
      // Non-critical: visitor may have been deleted
    });

    return {
      id: payload.id as string,
      name: payload.name as string,
      mobile: payload.mobile as string,
      email: payload.email as string | undefined,
      language: (payload.language as string) || 'en',
    };
  } catch {
    return null;
  }
}

/**
 * Requires a valid visitor session.
 * Throws UnauthorizedError if no valid session.
 */
export async function requireVisitor(): Promise<VisitorContext> {
  const visitor = await getVisitorSession();

  if (!visitor) {
    throw new UnauthorizedError('Registration required to access this content');
  }

  return visitor;
}

/**
 * Gets request context: admin, visitor, or anonymous.
 */
export async function getRequestContext(): Promise<{
  type: 'admin' | 'visitor' | 'anonymous';
  admin?: AdminContext;
  visitor?: VisitorContext;
}> {
  // Check admin first
  try {
    const admin = await requireAdmin();
    return { type: 'admin', admin };
  } catch {
    // Not an admin, continue
  }

  // Check visitor
  const visitor = await getVisitorSession();
  if (visitor) {
    return { type: 'visitor', visitor };
  }

  return { type: 'anonymous' };
}

/**
 * Extracts IP address from request headers.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}
