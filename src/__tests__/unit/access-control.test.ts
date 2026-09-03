// ─── Access Control Tests ───────────────────────────────────────────────────
// Tests that anonymous users cannot access gated fields (BRD §12, §14).
// ──────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { canViewPropertyField, canViewGatedCoreFields } from '@/modules/properties/access-control';
import type { PropertyFieldDefinition } from '@prisma/client';

const createField = (overrides: Partial<PropertyFieldDefinition> = {}): PropertyFieldDefinition => ({
  id: '1',
  key: 'test',
  label: 'Test',
  description: null,
  dataType: 'TEXT',
  options: [],
  validationRules: {},
  isRequired: false,
  isPublic: true,
  isGated: false,
  isFilterable: false,
  isSearchable: false,
  isActive: true,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  ...overrides,
});

describe('Property Access Control', () => {
  describe('canViewPropertyField', () => {
    it('admin can see all fields', () => {
      const field = createField({ isPublic: false, isGated: true });
      expect(canViewPropertyField(null, field, true)).toBe(true);
    });

    it('anonymous user can see public non-gated fields', () => {
      const field = createField({ isPublic: true, isGated: false });
      expect(canViewPropertyField(null, field)).toBe(true);
    });

    it('anonymous user CANNOT see gated fields', () => {
      const field = createField({ isPublic: true, isGated: true });
      expect(canViewPropertyField(null, field)).toBe(false);
    });

    it('registered visitor CAN see gated fields', () => {
      const visitor = { id: 'v1', name: 'Test', mobile: '9876543210', language: 'en' };
      const field = createField({ isPublic: true, isGated: true });
      expect(canViewPropertyField(visitor, field)).toBe(true);
    });

    it('inactive fields are never visible publicly', () => {
      const field = createField({ isActive: false });
      expect(canViewPropertyField(null, field)).toBe(false);
    });

    it('deleted fields are never visible', () => {
      const field = createField({ deletedAt: new Date() });
      expect(canViewPropertyField(null, field)).toBe(false);
    });

    it('non-public, non-gated fields are hidden from anonymous', () => {
      const field = createField({ isPublic: false, isGated: false });
      expect(canViewPropertyField(null, field)).toBe(false);
    });
  });

  describe('canViewGatedCoreFields', () => {
    it('anonymous cannot view gated core fields', () => {
      expect(canViewGatedCoreFields(null, false)).toBe(false);
    });

    it('registered visitor can view gated core fields', () => {
      const visitor = { id: 'v1', name: 'Test', mobile: '9876543210', language: 'en' };
      expect(canViewGatedCoreFields(visitor, false)).toBe(true);
    });

    it('admin can view gated core fields', () => {
      expect(canViewGatedCoreFields(null, true)).toBe(true);
    });
  });
});
