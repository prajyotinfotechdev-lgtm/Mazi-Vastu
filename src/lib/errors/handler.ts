// ─── Error Response Handler ──────────────────────────────────────────────────
// Centralized error-to-response mapper for API routes.
// Never exposes stack traces or internal details in production.
// ──────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './index';
import { logger } from '@/lib/logging/logger';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Converts any error into a consistent JSON error response.
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Zod validation errors
  if (error instanceof ZodError) {
    const details = error.issues.reduce(
      (acc, issue) => {
        const path = issue.path.join('.');
        acc[path] = issue.message;
        return acc;
      },
      {} as Record<string, string>
    );

    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details,
        },
      },
      { status: 400 }
    );
  }

  // Application errors
  if (error instanceof AppError) {
    if (!error.isOperational) {
      logger.error('Non-operational error', {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && process.env.NODE_ENV !== 'production'
            ? { details: error.details }
            : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  // Prisma known request errors
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    typeof (error as { code: string }).code === 'string'
  ) {
    const prismaError = error as { code: string; meta?: Record<string, unknown> };

    if (prismaError.code === 'P2002') {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'A record with this value already exists',
          },
        },
        { status: 409 }
      );
    }

    if (prismaError.code === 'P2025') {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: 'Record not found',
          },
        },
        { status: 404 }
      );
    }
  }

  // Unknown errors — never leak internals
  logger.error('Unhandled error', {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}
