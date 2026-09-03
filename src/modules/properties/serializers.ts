// ─── Property Serializers ───────────────────────────────────────────────────
// Three explicit serializers enforcing access control at the data layer.
// The backend NEVER sends unauthorized data — frontend blur is not security.
// ──────────────────────────────────────────────────────────────────────────────

import type { Property, PropertyMedia, PropertyType } from '@prisma/client';
import { filterFieldsByAccess } from '@/modules/custom-fields/validator';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PropertyWithRelations extends Property {
  propertyType: Pick<PropertyType, 'id' | 'name' | 'slug'>;
  media: PropertyMedia[];
}

export interface PublicPropertyDTO {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  propertyType: { id: string; name: string; slug: string };
  status: string;
  approximateLocation: string | null;
  price: number | null;
  priceType: string | null;
  metadata: Record<string, unknown>;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  media: MediaDTO[];
}

export interface RegisteredPropertyDTO extends PublicPropertyDTO {
  gatedLocation: string | null;
  size: number | null;
  sizeUnit: string | null;
}

export interface AdminPropertyDTO extends RegisteredPropertyDTO {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface MediaDTO {
  id: string;
  publicUrl: string;
  mediaType: string;
  altText: string | null;
  sortOrder: number;
  width: number | null;
  height: number | null;
}

// ─── Serializers ─────────────────────────────────────────────────────────────

/**
 * Serializes a property for anonymous (public) visitors.
 * STRIPS: gated location, gated size, gated custom fields, internal dates.
 */
export async function serializePublicProperty(
  property: PropertyWithRelations
): Promise<PublicPropertyDTO> {
  // Filter metadata to only include public (non-gated) fields
  const metadata = (property.metadata as Record<string, unknown>) || {};
  const filteredMetadata = await filterFieldsByAccess(metadata, false);

  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    description: property.description,
    propertyType: {
      id: property.propertyType.id,
      name: property.propertyType.name,
      slug: property.propertyType.slug,
    },
    status: property.status,
    approximateLocation: property.approximateLocation,
    // Size is gated by default for anonymous users
    price: property.price,
    priceType: property.priceType,
    metadata: filteredMetadata,
    seoTitle: property.seoTitle,
    seoDescription: property.seoDescription,
    publishedAt: property.publishedAt?.toISOString() || null,
    media: serializeMedia(property.media),
  };
}

/**
 * Serializes a property for registered visitors.
 * INCLUDES: gated location, gated size, gated custom fields.
 * STRIPS: internal metadata, admin notes, dates.
 */
export async function serializeRegisteredProperty(
  property: PropertyWithRelations
): Promise<RegisteredPropertyDTO> {
  const publicData = await serializePublicProperty(property);

  // Re-filter metadata with registered access
  const metadata = (property.metadata as Record<string, unknown>) || {};
  const filteredMetadata = await filterFieldsByAccess(metadata, true);

  return {
    ...publicData,
    gatedLocation: property.gatedLocation,
    size: property.size,
    sizeUnit: property.sizeUnit,
    metadata: filteredMetadata,
  };
}

/**
 * Serializes a property for admin users.
 * INCLUDES: all fields, all metadata, all dates.
 */
export async function serializeAdminProperty(
  property: PropertyWithRelations
): Promise<AdminPropertyDTO> {
  const registeredData = await serializeRegisteredProperty(property);

  return {
    ...registeredData,
    metadata: (property.metadata as Record<string, unknown>) || {},
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    deletedAt: property.deletedAt?.toISOString() || null,
  };
}

/**
 * Serializes media list. Strips internal fields.
 */
function serializeMedia(media: PropertyMedia[]): MediaDTO[] {
  return media
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => ({
      id: m.id,
      publicUrl: m.publicUrl,
      mediaType: m.mediaType,
      altText: m.altText,
      sortOrder: m.sortOrder,
      width: m.width,
      height: m.height,
    }));
}
