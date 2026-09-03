// ─── Dynamic Field Validation Tests ─────────────────────────────────────────
// Tests for the dynamic field validation engine (BRD §8, §9).
// Validates: data types, required fields, SELECT options, unknown fields, ranges.
// ──────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockFindMany = vi.fn();
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    propertyFieldDefinition: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

// Import after mocks
const { validateDynamicFields, filterFieldsByAccess } = await import(
  '@/modules/custom-fields/validator'
);

// ─── Test Field Definitions ──────────────────────────────────────────────────

const mockDefinitions = [
  {
    id: '1',
    key: 'facing',
    label: 'Facing',
    description: null,
    dataType: 'SELECT',
    options: ['East', 'West', 'North', 'South'],
    validationRules: {},
    isRequired: false,
    isPublic: true,
    isGated: false,
    isFilterable: true,
    isSearchable: false,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: '2',
    key: 'bedrooms',
    label: 'Bedrooms',
    description: null,
    dataType: 'NUMBER',
    options: [],
    validationRules: { min: 0, max: 20 },
    isRequired: true,
    isPublic: true,
    isGated: false,
    isFilterable: true,
    isSearchable: false,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: '3',
    key: 'parking',
    label: 'Parking',
    description: null,
    dataType: 'BOOLEAN',
    options: [],
    validationRules: {},
    isRequired: false,
    isPublic: true,
    isGated: false,
    isFilterable: true,
    isSearchable: false,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: '4',
    key: 'ownerContact',
    label: 'Owner Contact',
    description: null,
    dataType: 'TEXT',
    options: [],
    validationRules: {},
    isRequired: false,
    isPublic: false,
    isGated: true,
    isFilterable: false,
    isSearchable: false,
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: '5',
    key: 'amenities',
    label: 'Amenities',
    description: null,
    dataType: 'MULTI_SELECT',
    options: ['Pool', 'Gym', 'Garden', 'Security'],
    validationRules: {},
    isRequired: false,
    isPublic: true,
    isGated: false,
    isFilterable: false,
    isSearchable: false,
    isActive: true,
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
];

beforeEach(() => {
  mockFindMany.mockResolvedValue(mockDefinitions);
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Dynamic Field Validation', () => {
  describe('validateDynamicFields', () => {
    it('should accept valid values', async () => {
      const result = await validateDynamicFields({
        facing: 'East',
        bedrooms: 3,
        parking: true,
      });

      expect(result).toEqual({
        facing: 'East',
        bedrooms: 3,
        parking: true,
      });
    });

    it('should reject unknown fields', async () => {
      await expect(
        validateDynamicFields({
          facing: 'East',
          bedrooms: 3,
          unknownField: 'value',
        })
      ).rejects.toThrow('Dynamic field validation failed');
    });

    it('should enforce required fields on create', async () => {
      await expect(
        validateDynamicFields({
          facing: 'East',
          // bedrooms is required but missing
        })
      ).rejects.toThrow('Dynamic field validation failed');
    });

    it('should skip required check on update', async () => {
      const result = await validateDynamicFields(
        { facing: 'West' },
        true // isUpdate
      );

      expect(result).toEqual({ facing: 'West' });
    });

    it('should validate SELECT options', async () => {
      await expect(
        validateDynamicFields({
          facing: 'InvalidDirection',
          bedrooms: 2,
        })
      ).rejects.toThrow('Dynamic field validation failed');
    });

    it('should validate MULTI_SELECT options', async () => {
      await expect(
        validateDynamicFields({
          bedrooms: 2,
          amenities: ['Pool', 'InvalidAmenity'],
        })
      ).rejects.toThrow('Dynamic field validation failed');
    });

    it('should accept valid MULTI_SELECT options', async () => {
      const result = await validateDynamicFields({
        bedrooms: 2,
        amenities: ['Pool', 'Gym'],
      });

      expect(result.amenities).toEqual(['Pool', 'Gym']);
    });

    it('should validate NUMBER type', async () => {
      await expect(
        validateDynamicFields({
          bedrooms: 'not-a-number',
        })
      ).rejects.toThrow();
    });

    it('should validate numeric ranges', async () => {
      await expect(
        validateDynamicFields({
          bedrooms: 25, // max is 20
        })
      ).rejects.toThrow();
    });

    it('should validate BOOLEAN type', async () => {
      await expect(
        validateDynamicFields({
          bedrooms: 2,
          parking: 'yes', // should be boolean
        })
      ).rejects.toThrow();
    });

    it('should sanitize text values (trim)', async () => {
      const result = await validateDynamicFields(
        { ownerContact: '  John Doe  ' },
        true
      );

      expect(result.ownerContact).toBe('John Doe');
    });
  });

  describe('filterFieldsByAccess', () => {
    it('should return only public fields for anonymous users', async () => {
      const metadata = {
        facing: 'East',
        bedrooms: 3,
        parking: true,
        ownerContact: 'Secret Contact',
      };

      const filtered = await filterFieldsByAccess(metadata, false);

      expect(filtered).toHaveProperty('facing');
      expect(filtered).toHaveProperty('bedrooms');
      expect(filtered).toHaveProperty('parking');
      expect(filtered).not.toHaveProperty('ownerContact');
    });

    it('should return gated fields for registered users', async () => {
      const metadata = {
        facing: 'East',
        ownerContact: 'Secret Contact',
      };

      const filtered = await filterFieldsByAccess(metadata, true);

      expect(filtered).toHaveProperty('facing');
      expect(filtered).toHaveProperty('ownerContact');
    });
  });
});
