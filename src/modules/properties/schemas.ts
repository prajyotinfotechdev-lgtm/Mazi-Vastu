// ─── Property Schemas ───────────────────────────────────────────────────────
// Zod schemas for property CRUD, publishing, and filtering.
// ──────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';
import { paginationSchema } from '@/lib/validation/schemas';

export const createPropertySchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).optional(),
  propertyTypeId: z.string().min(1, 'Property type is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SOLD', 'RENTED', 'INACTIVE']).optional(),
  approximateLocation: z.string().max(500).optional(),
  gatedLocation: z.string().max(500).optional(),
  size: z.number().positive().optional(),
  sizeUnit: z.enum(['SQFT', 'SQMT', 'ACRE', 'HECTARE', 'GUNTHA']).optional(),
  price: z.number().positive().optional(),
  priceType: z.enum(['FIXED', 'NEGOTIABLE', 'ON_REQUEST', 'PER_SQFT', 'PER_MONTH']).optional(),
  metadata: z.record(z.unknown()).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  media: z.array(z.object({
    publicId: z.string(),
    publicUrl: z.string(),
    mediaType: z.enum(['IMAGE', 'VIDEO']),
    mimeType: z.string(),
  })).optional(),
});

export const updatePropertySchema = createPropertySchema.partial().extend({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
});

export const publishPropertySchema = z.object({
  propertyId: z.string().min(1),
});

export const propertyFilterSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SOLD', 'RENTED', 'INACTIVE']).optional(),
  propertyTypeId: z.string().optional(),
  q: z.string().max(200).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  ...paginationSchema.shape,
});

export const publicPropertyFilterSchema = z.object({
  propertyTypeId: z.string().optional(),
  q: z.string().max(200).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  ...paginationSchema.shape,
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyFilterInput = z.infer<typeof propertyFilterSchema>;
export type PublicPropertyFilterInput = z.infer<typeof publicPropertyFilterSchema>;
