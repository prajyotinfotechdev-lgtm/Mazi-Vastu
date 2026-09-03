// ─── Shared Zod Validation Schemas ──────────────────────────────────────────
// Reusable schemas for pagination, phone, email, common fields.
// ──────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

// ─── Pagination ──────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type CursorPaginationInput = z.infer<typeof cursorPaginationSchema>;

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

// ─── Common Field Schemas ────────────────────────────────────────────────────

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format')
  .transform((val) => val.replace(/\s+/g, ''));

export const indianMobileSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number')
  .transform((val) => val.replace(/\s+/g, ''));

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .transform((val) => val.toLowerCase().trim());

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
  .min(1)
  .max(200);

export const idSchema = z.string().min(1, 'ID is required');

export const sortOrderSchema = z.coerce.number().int().min(0).default(0);

// ─── Search / Filter ────────────────────────────────────────────────────────

export const searchSchema = z.object({
  q: z.string().max(200).optional(),
  ...paginationSchema.shape,
});

// ─── Date Schemas ────────────────────────────────────────────────────────────

export const dateSchema = z.coerce.date();

export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: 'startDate must be before or equal to endDate' }
);
