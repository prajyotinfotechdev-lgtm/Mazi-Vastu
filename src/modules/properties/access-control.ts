// ─── Property Access Control ────────────────────────────────────────────────
// Centralized authorization logic for property field visibility.
// The backend decides which fields are returned — never the frontend.
// ──────────────────────────────────────────────────────────────────────────────

import type { PropertyFieldDefinition } from '@prisma/client';
import type { VisitorContext } from '@/lib/auth/middleware';

export type AccessLevel = 'public' | 'registered' | 'admin';

/**
 * Determines if a visitor can view a specific property field.
 * This is the single source of truth for field-level access.
 */
export function canViewPropertyField(
  visitorContext: VisitorContext | null,
  fieldDefinition: PropertyFieldDefinition,
  isAdmin = false
): boolean {
  // Admins can see everything
  if (isAdmin) return true;

  // Inactive fields are never visible publicly
  if (!fieldDefinition.isActive) return false;

  // Deleted fields are never visible
  if (fieldDefinition.deletedAt) return false;

  // Public, non-gated fields are visible to everyone
  if (fieldDefinition.isPublic && !fieldDefinition.isGated) return true;

  // Gated fields require registration
  if (fieldDefinition.isGated) {
    return visitorContext !== null;
  }

  // Default: visible if public
  return fieldDefinition.isPublic;
}

/**
 * Determines the access level from context.
 */
export function getAccessLevel(
  visitorContext: VisitorContext | null,
  isAdmin: boolean
): AccessLevel {
  if (isAdmin) return 'admin';
  if (visitorContext) return 'registered';
  return 'public';
}

/**
 * Checks if core property fields should be visible.
 * Size and gated location are gated by default.
 */
export function canViewGatedCoreFields(
  visitorContext: VisitorContext | null,
  isAdmin: boolean
): boolean {
  return isAdmin || visitorContext !== null;
}
