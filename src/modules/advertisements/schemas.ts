// ─── Advertisement Schemas ──────────────────────────────────────────────────
// Zod schemas for advertisement CRUD, placement, and filtering.
// ──────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';
import { paginationSchema } from '@/lib/validation/schemas';

const baseAdvertisementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).optional(),
  projectInformation: z.string().max(5000).optional(),
  contactName: z.string().max(200).optional(),
  contactPhone: z.string().max(20).optional(),
  contactEmail: z.string().email().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED']).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortOrder: z.number().int().min(0).default(0),
  media: z.array(z.object({
    publicId: z.string(),
    publicUrl: z.string(),
    mediaType: z.enum(['IMAGE', 'VIDEO']),
    mimeType: z.string(),
  })).optional(),
});

export const createAdvertisementSchema = baseAdvertisementSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  { message: 'startDate must be before or equal to endDate' }
);

export const updateAdvertisementSchema = baseAdvertisementSchema.partial();

export const advertisementPlacementSchema = z.object({
  placements: z.array(
    z.object({
      placementZone: z.enum([
        'HOMEPAGE_BANNER',
        'CATEGORY_PAGE_SLOT',
        'SERVICE_PAGE_SLOT',
        'FOOTER_STRIP',
      ]),
      pageContext: z.string().max(200).optional(),
      categoryContext: z.string().max(200).optional(),
      sortOrder: z.number().int().min(0).default(0),
    })
  ).min(1, 'At least one placement is required'),
});

export const advertisementFilterSchema = z.object({
  status: z
    .enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED'])
    .optional(),
  placement: z
    .enum(['HOMEPAGE_BANNER', 'CATEGORY_PAGE_SLOT', 'SERVICE_PAGE_SLOT', 'FOOTER_STRIP'])
    .optional(),
  q: z.string().max(200).optional(),
  ...paginationSchema.shape,
});

export const publicAdvertisementFilterSchema = z.object({
  placement: z
    .enum(['HOMEPAGE_BANNER', 'CATEGORY_PAGE_SLOT', 'SIDEBAR', 'FOOTER_STRIP'])
    .optional(),
  pageContext: z.string().max(200).optional(),
  categoryContext: z.string().max(200).optional(),
  ...paginationSchema.shape,
});

export type CreateAdvertisementInput = z.infer<typeof createAdvertisementSchema>;
export type UpdateAdvertisementInput = z.infer<typeof updateAdvertisementSchema>;
export type AdvertisementPlacementInput = z.infer<typeof advertisementPlacementSchema>;
export type AdvertisementFilterInput = z.infer<typeof advertisementFilterSchema>;
export type PublicAdvertisementFilterInput = z.infer<typeof publicAdvertisementFilterSchema>;
