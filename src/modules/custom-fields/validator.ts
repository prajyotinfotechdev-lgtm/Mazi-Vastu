// ─── Dynamic Field Validation Engine ────────────────────────────────────────
// Validates property metadata (JSONB) against admin-configured field definitions.
// Never trusts client-supplied JSON.
// ──────────────────────────────────────────────────────────────────────────────

import { prisma } from '@/lib/db/prisma';
import { ValidationError } from '@/lib/errors';
import type { PropertyFieldDefinition, FieldDataType } from '@prisma/client';

interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, unknown>;
}

interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

/**
 * Loads all active field definitions from the database.
 */
export async function loadActiveFieldDefinitions(): Promise<PropertyFieldDefinition[]> {
  return prisma.propertyFieldDefinition.findMany({
    where: {
      isActive: true,
      deletedAt: null,
    },
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Validates submitted property metadata against active field definitions.
 *
 * Steps:
 * 1. Load active field definitions
 * 2. Validate submitted keys (reject unknown)
 * 3. Validate required fields
 * 4. Validate data types
 * 5. Validate SELECT/MULTI_SELECT options
 * 6. Validate numeric ranges
 * 7. Sanitize values
 */
export async function validateDynamicFields(
  submittedData: Record<string, unknown>,
  isUpdate = false
): Promise<Record<string, unknown>> {
  const definitions = await loadActiveFieldDefinitions();
  const definitionMap = new Map(definitions.map((d) => [d.key, d]));

  const errors: Record<string, string> = {};
  const sanitized: Record<string, unknown> = {};

  // Step 1: Reject unknown fields
  for (const key of Object.keys(submittedData)) {
    if (!definitionMap.has(key)) {
      errors[key] = `Unknown field '${key}'`;
    }
  }

  // Step 2: Validate each defined field
  for (const definition of definitions) {
    const { key, dataType, isRequired, options, validationRules } = definition;
    const value = submittedData[key];
    const rules = (validationRules as ValidationRules) || {};

    // Check required fields (skip on partial update if field not submitted)
    if (isRequired && !isUpdate) {
      if (value === undefined || value === null || value === '') {
        errors[key] = `Field '${definition.label}' is required`;
        continue;
      }
    }

    // Skip if not submitted (for updates)
    if (value === undefined) continue;

    // Allow null to clear optional fields
    if (value === null && !isRequired) {
      sanitized[key] = null;
      continue;
    }

    // Validate data type
    const typeError = validateDataType(key, value, dataType, definition.label);
    if (typeError) {
      errors[key] = typeError;
      continue;
    }

    // Validate SELECT options
    if (dataType === 'SELECT' && options) {
      const allowedOptions = options as string[];
      if (!allowedOptions.includes(value as string)) {
        errors[key] = `Invalid option for '${definition.label}'. Allowed: ${allowedOptions.join(', ')}`;
        continue;
      }
    }

    // Validate MULTI_SELECT options
    if (dataType === 'MULTI_SELECT' && options) {
      const allowedOptions = options as string[];
      const selectedValues = value as string[];
      const invalidOptions = selectedValues.filter((v) => !allowedOptions.includes(v));
      if (invalidOptions.length > 0) {
        errors[key] = `Invalid options for '${definition.label}': ${invalidOptions.join(', ')}`;
        continue;
      }
    }

    // Validate numeric ranges
    if (dataType === 'NUMBER' && typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors[key] = `'${definition.label}' must be at least ${rules.min}`;
        continue;
      }
      if (rules.max !== undefined && value > rules.max) {
        errors[key] = `'${definition.label}' must be at most ${rules.max}`;
        continue;
      }
    }

    // Validate text length
    if (dataType === 'TEXT' && typeof value === 'string') {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors[key] = `'${definition.label}' must be at least ${rules.minLength} characters`;
        continue;
      }
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors[key] = `'${definition.label}' must be at most ${rules.maxLength} characters`;
        continue;
      }
      if (rules.pattern) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          errors[key] = `'${definition.label}' does not match the required format`;
          continue;
        }
      }
    }

    // Sanitize and store
    sanitized[key] = sanitizeValue(value, dataType);
  }

  // Throw if any errors
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Dynamic field validation failed', errors);
  }

  return sanitized;
}

/**
 * Validates the data type of a submitted value.
 */
function validateDataType(
  key: string,
  value: unknown,
  dataType: FieldDataType,
  label: string
): string | null {
  switch (dataType) {
    case 'TEXT':
      if (typeof value !== 'string') {
        return `'${label}' must be a text value`;
      }
      break;

    case 'NUMBER':
      if (typeof value !== 'number' || isNaN(value)) {
        return `'${label}' must be a number`;
      }
      break;

    case 'BOOLEAN':
      if (typeof value !== 'boolean') {
        return `'${label}' must be true or false`;
      }
      break;

    case 'SELECT':
      if (typeof value !== 'string') {
        return `'${label}' must be a text value`;
      }
      break;

    case 'MULTI_SELECT':
      if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
        return `'${label}' must be an array of text values`;
      }
      break;

    case 'DATE':
      if (typeof value !== 'string' || isNaN(Date.parse(value))) {
        return `'${label}' must be a valid date string`;
      }
      break;
  }

  return null;
}

/**
 * Sanitizes a value based on its data type.
 */
function sanitizeValue(value: unknown, dataType: FieldDataType): unknown {
  switch (dataType) {
    case 'TEXT':
    case 'SELECT':
      return typeof value === 'string' ? value.trim() : value;

    case 'NUMBER':
      return typeof value === 'number' ? value : parseFloat(value as string);

    case 'BOOLEAN':
      return Boolean(value);

    case 'MULTI_SELECT':
      return Array.isArray(value)
        ? value.map((v) => (typeof v === 'string' ? v.trim() : v))
        : value;

    case 'DATE':
      return typeof value === 'string' ? new Date(value).toISOString() : value;

    default:
      return value;
  }
}

/**
 * Filters property metadata based on visitor access level.
 * Returns only fields the visitor is authorized to see.
 */
export async function filterFieldsByAccess(
  metadata: Record<string, unknown>,
  isRegistered: boolean
): Promise<Record<string, unknown>> {
  const definitions = await loadActiveFieldDefinitions();
  const filtered: Record<string, unknown> = {};

  for (const definition of definitions) {
    const value = metadata[definition.key];
    if (value === undefined || value === null) continue;

    // Public fields are always visible
    if (definition.isPublic && !definition.isGated) {
      filtered[definition.key] = value;
      continue;
    }

    // Gated fields only visible to registered visitors
    if (definition.isGated && isRegistered) {
      filtered[definition.key] = value;
      continue;
    }

    // Public + non-gated fields visible to all
    if (definition.isPublic) {
      filtered[definition.key] = value;
    }
  }

  return filtered;
}

/**
 * Gets field definitions visible to the current access level.
 */
export async function getVisibleFieldDefinitions(
  isRegistered: boolean
): Promise<Partial<PropertyFieldDefinition>[]> {
  const definitions = await loadActiveFieldDefinitions();

  return definitions
    .filter((d) => {
      if (d.isPublic && !d.isGated) return true;
      if (d.isGated && isRegistered) return true;
      if (d.isPublic) return true;
      return false;
    })
    .map((d) => ({
      key: d.key,
      label: d.label,
      description: d.description,
      dataType: d.dataType,
      options: d.options,
      isRequired: d.isRequired,
      isFilterable: d.isFilterable,
      sortOrder: d.sortOrder,
    }));
}
