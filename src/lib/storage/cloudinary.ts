// ─── Cloudinary Storage Provider ─────────────────────────────────────────────
// Abstraction over Cloudinary for media uploads, deletions, and URL generation.
// Used by both Property and Advertisement media modules.
// ──────────────────────────────────────────────────────────────────────────────

import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import { ExternalServiceError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logging/logger';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MediaUploadResult {
  publicId: string;
  publicUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
}

export interface UploadOptions {
  folder: string;         // e.g., "properties" or "advertisements"
  resourceType: 'image' | 'video';
  allowedFormats?: string[];
  maxFileSize?: number;   // bytes
  transformation?: Record<string, unknown>[];
}

export interface SignedUploadParams {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId: string;
  uploadPreset?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
const ALLOWED_VIDEO_FORMATS = ['mp4', 'mov', 'webm'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;  // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
]);

// ─── Initialization ─────────────────────────────────────────────────────────

let isConfigured = false;

function ensureConfigured(): void {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new ExternalServiceError(
      'Cloudinary',
      'Cloudinary credentials are not configured'
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Validates file metadata before upload.
 * Never trusts client-provided filenames.
 */
export function validateMediaFile(
  mimeType: string,
  fileSize: number,
  resourceType: 'image' | 'video'
): void {
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new ValidationError(`File type '${mimeType}' is not allowed`, {
      allowedTypes: Array.from(ALLOWED_MIME_TYPES),
    });
  }

  // Validate resource type matches MIME
  if (resourceType === 'image' && !mimeType.startsWith('image/')) {
    throw new ValidationError('Expected an image file');
  }
  if (resourceType === 'video' && !mimeType.startsWith('video/')) {
    throw new ValidationError('Expected a video file');
  }

  // Validate file size
  const maxSize = resourceType === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  if (fileSize > maxSize) {
    throw new ValidationError(
      `File size ${(fileSize / 1024 / 1024).toFixed(1)}MB exceeds the ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`
    );
  }
}

/**
 * Generates a server-side object key. Never uses client filenames.
 */
export function generatePublicId(folder: string): string {
  const timestamp = Date.now();
  const uniqueId = uuidv4().slice(0, 8);
  return `${folder}/${timestamp}-${uniqueId}`;
}

// ─── Upload Operations ───────────────────────────────────────────────────────

/**
 * Generate signed upload parameters for client-side direct upload to Cloudinary.
 * The server generates the signature; the client uploads directly to Cloudinary.
 */
export function createSignedUploadParams(
  folder: string,
  resourceType: 'image' | 'video'
): SignedUploadParams {
  ensureConfigured();

  const publicId = generatePublicId(folder);
  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
    public_id: publicId,
  };

  // Add format restrictions
  if (resourceType === 'image') {
    paramsToSign.allowed_formats = ALLOWED_IMAGE_FORMATS.join(',');
  } else {
    paramsToSign.allowed_formats = ALLOWED_VIDEO_FORMATS.join(',');
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
    publicId,
  };
}

/**
 * Upload a file buffer directly from the server.
 * Used for server-side processing or migration.
 */
export async function uploadMedia(
  buffer: Buffer,
  options: UploadOptions
): Promise<MediaUploadResult> {
  ensureConfigured();

  const publicId = generatePublicId(options.folder);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: options.resourceType,
        folder: options.folder,
        allowed_formats:
          options.resourceType === 'image'
            ? ALLOWED_IMAGE_FORMATS
            : ALLOWED_VIDEO_FORMATS,
        ...(options.transformation
          ? { transformation: options.transformation }
          : {}),
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          logger.error('Cloudinary upload failed', {
            error: error?.message,
            folder: options.folder,
          });
          reject(
            new ExternalServiceError('Cloudinary', 'Failed to upload media')
          );
          return;
        }

        resolve({
          publicId: result.public_id,
          publicUrl: result.secure_url,
          mediaType: options.resourceType === 'image' ? 'IMAGE' : 'VIDEO',
          mimeType: `${options.resourceType}/${result.format}`,
          fileSize: result.bytes,
          width: result.width,
          height: result.height,
          duration: result.duration,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

// ─── Delete Operations ───────────────────────────────────────────────────────

/**
 * Deletes a media resource from Cloudinary.
 */
export async function deleteMedia(
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<boolean> {
  ensureConfigured();

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === 'ok';
  } catch (error) {
    logger.error('Cloudinary delete failed', {
      publicId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

/**
 * Deletes multiple media resources from Cloudinary.
 */
export async function deleteMultipleMedia(
  publicIds: string[],
  resourceType: 'image' | 'video' = 'image'
): Promise<void> {
  ensureConfigured();

  if (publicIds.length === 0) return;

  try {
    await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
  } catch (error) {
    logger.error('Cloudinary bulk delete failed', {
      count: publicIds.length,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ─── URL Operations ──────────────────────────────────────────────────────────

/**
 * Gets an optimized public URL for a media resource.
 */
export function getPublicUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    resourceType?: 'image' | 'video';
  }
): string {
  ensureConfigured();

  const transformations: Record<string, unknown>[] = [];

  if (options?.width || options?.height) {
    transformations.push({
      width: options.width,
      height: options.height,
      crop: 'fill',
      gravity: 'auto',
    });
  }

  if (options?.quality) {
    transformations.push({ quality: options.quality });
  }

  return cloudinary.url(publicId, {
    secure: true,
    resource_type: options?.resourceType || 'image',
    format: options?.format || 'auto',
    transformation: transformations.length > 0 ? transformations : undefined,
  });
}

/**
 * Checks if a media resource exists in Cloudinary.
 */
export async function mediaExists(
  publicId: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<boolean> {
  ensureConfigured();

  try {
    await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
    return true;
  } catch {
    return false;
  }
}
