// ─── Media Service ──────────────────────────────────────────────────────────
// Handles media upload/deletion for both Properties and Advertisements.
// Uses Cloudinary storage. Never stores binaries in PostgreSQL.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';
import {
  uploadMedia as cloudinaryUpload,
  deleteMedia as cloudinaryDelete,
  validateMediaFile,
  createSignedUploadParams,
  type MediaUploadResult,
} from '@/lib/storage/cloudinary';
import { z } from 'zod';

// ─── Schemas ─────────────────────────────────────────────────────────────────

export const requestUploadSchema = z.object({
  resourceType: z.enum(['image', 'video']),
  entityType: z.enum(['property', 'advertisement']),
  entityId: z.string().min(1),
});

export const confirmUploadSchema = z.object({
  entityType: z.enum(['property', 'advertisement']),
  entityId: z.string().min(1),
  publicId: z.string().min(1),
  publicUrl: z.string().url(),
  mediaType: z.enum(['IMAGE', 'VIDEO']),
  mimeType: z.string().min(1),
  fileSize: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  altText: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export type RequestUploadInput = z.infer<typeof requestUploadSchema>;
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;

// ─── Service ─────────────────────────────────────────────────────────────────

export class MediaService {
  /**
   * Generates signed upload parameters for client-side direct upload.
   */
  static async requestUpload(input: RequestUploadInput) {
    // Verify entity exists
    if (input.entityType === 'property') {
      const property = await prisma.property.findUnique({
        where: { id: input.entityId, deletedAt: null },
      });
      if (!property) throw new NotFoundError('Property', input.entityId);
    } else {
      const ad = await prisma.advertisement.findUnique({
        where: { id: input.entityId, deletedAt: null },
      });
      if (!ad) throw new NotFoundError('Advertisement', input.entityId);
    }

    const folder = `majivastu/${input.entityType}`;
    const params = createSignedUploadParams(folder, input.resourceType);

    return params;
  }

  /**
   * Confirms an upload and creates the media record.
   * Called after client successfully uploads to Cloudinary.
   */
  static async confirmUpload(input: ConfirmUploadInput) {
    if (input.entityType === 'property') {
      return this.createPropertyMedia(input);
    } else {
      return this.createAdvertisementMedia(input);
    }
  }

  /**
   * Creates a property media record.
   */
  private static async createPropertyMedia(input: ConfirmUploadInput) {
    const property = await prisma.property.findUnique({
      where: { id: input.entityId, deletedAt: null },
    });

    if (!property) throw new NotFoundError('Property', input.entityId);

    return prisma.propertyMedia.create({
      data: {
        propertyId: input.entityId,
        publicId: input.publicId,
        publicUrl: input.publicUrl,
        mediaType: input.mediaType,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        width: input.width,
        height: input.height,
        duration: input.duration,
        altText: input.altText,
        sortOrder: input.sortOrder,
      },
    });
  }

  /**
   * Creates an advertisement media record.
   */
  private static async createAdvertisementMedia(input: ConfirmUploadInput) {
    const ad = await prisma.advertisement.findUnique({
      where: { id: input.entityId, deletedAt: null },
    });

    if (!ad) throw new NotFoundError('Advertisement', input.entityId);

    return prisma.advertisementMedia.create({
      data: {
        advertisementId: input.entityId,
        publicId: input.publicId,
        publicUrl: input.publicUrl,
        mediaType: input.mediaType,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        width: input.width,
        height: input.height,
        duration: input.duration,
        altText: input.altText,
        sortOrder: input.sortOrder,
      },
    });
  }

  /**
   * Deletes a property media record and its Cloudinary resource.
   */
  static async deletePropertyMedia(mediaId: string) {
    const media = await prisma.propertyMedia.findUnique({
      where: { id: mediaId },
    });

    if (!media) throw new NotFoundError('PropertyMedia', mediaId);

    // Delete from Cloudinary
    await cloudinaryDelete(
      media.publicId,
      media.mediaType === 'VIDEO' ? 'video' : 'image'
    );

    // Delete record
    await prisma.propertyMedia.delete({ where: { id: mediaId } });

    return { deleted: true };
  }

  /**
   * Deletes an advertisement media record and its Cloudinary resource.
   */
  static async deleteAdvertisementMedia(mediaId: string) {
    const media = await prisma.advertisementMedia.findUnique({
      where: { id: mediaId },
    });

    if (!media) throw new NotFoundError('AdvertisementMedia', mediaId);

    // Delete from Cloudinary
    await cloudinaryDelete(
      media.publicId,
      media.mediaType === 'VIDEO' ? 'video' : 'image'
    );

    // Delete record
    await prisma.advertisementMedia.delete({ where: { id: mediaId } });

    return { deleted: true };
  }

  /**
   * Server-side upload from buffer (for admin bulk uploads or migration).
   */
  static async uploadFromBuffer(
    buffer: Buffer,
    mimeType: string,
    entityType: 'property' | 'advertisement',
    entityId: string,
    options?: { altText?: string; sortOrder?: number }
  ): Promise<MediaUploadResult> {
    const resourceType = mimeType.startsWith('video/') ? 'video' : 'image';

    // Validate
    validateMediaFile(mimeType, buffer.length, resourceType);

    // Upload to Cloudinary
    const result = await cloudinaryUpload(buffer, {
      folder: `majivastu/${entityType}`,
      resourceType,
    });

    // Create database record
    if (entityType === 'property') {
      await prisma.propertyMedia.create({
        data: {
          propertyId: entityId,
          publicId: result.publicId,
          publicUrl: result.publicUrl,
          mediaType: result.mediaType,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          width: result.width,
          height: result.height,
          duration: result.duration,
          altText: options?.altText,
          sortOrder: options?.sortOrder || 0,
        },
      });
    } else {
      await prisma.advertisementMedia.create({
        data: {
          advertisementId: entityId,
          publicId: result.publicId,
          publicUrl: result.publicUrl,
          mediaType: result.mediaType,
          mimeType: result.mimeType,
          fileSize: result.fileSize,
          width: result.width,
          height: result.height,
          duration: result.duration,
          altText: options?.altText,
          sortOrder: options?.sortOrder || 0,
        },
      });
    }

    return result;
  }
}
