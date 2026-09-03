// ─── Error Handler Tests ────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { ZodError, z } from 'zod';
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} from '@/lib/errors';

describe('Application Errors', () => {
  it('ValidationError should have 400 status', () => {
    const error = new ValidationError('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.isOperational).toBe(true);
  });

  it('UnauthorizedError should have 401 status', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('ForbiddenError should have 403 status', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  it('NotFoundError should have 404 status and formatted code', () => {
    const error = new NotFoundError('Property', 'abc123');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('PROPERTY_NOT_FOUND');
    expect(error.message).toBe("Property 'abc123' not found");
  });

  it('ConflictError should have 409 status', () => {
    const error = new ConflictError('Duplicate slug');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });

  it('RateLimitError should have 429 status', () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMITED');
  });

  it('ValidationError should carry details', () => {
    const error = new ValidationError('Bad input', { field: 'must be string' });
    expect(error.details).toEqual({ field: 'must be string' });
  });
});
