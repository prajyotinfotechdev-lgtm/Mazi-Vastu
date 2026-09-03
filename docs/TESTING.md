# Testing

## Test Stack

- **Unit tests**: Vitest
- **E2E tests**: Playwright (future)
- **Coverage**: V8 provider

## Running Tests

```bash
# Unit tests
npm run test

# Watch mode
npx vitest --watch

# With coverage
npx vitest --coverage
```

## Test Structure

```
src/__tests__/
  setup.ts                           # Environment setup
  unit/
    errors.test.ts                   # Error types and codes
    rate-limiter.test.ts             # Rate limiter behavior
    whatsapp.test.ts                 # WhatsApp URL generation
    access-control.test.ts           # Field access control
    dynamic-fields.test.ts           # Dynamic field validation
    advertisement-isolation.test.ts  # BRD §53 mandatory test
```

## Critical Test Cases

### 1. Advertisement Independence (BRD §53) — MANDATORY
- Advertisement can be created without any Property
- Deleting an ad does NOT affect any Property
- Modifying a Property does NOT affect any Advertisement
- Zero FK from Advertisement to Property

### 2. Access Control Gate
- Anonymous users cannot see gated fields
- Registered users CAN see gated fields
- Admin sees all fields
- Inactive/deleted fields are always hidden

### 3. Dynamic Field Validation
- Accepts valid values per field type
- Rejects unknown field keys
- Enforces required fields on create (not update)
- Validates SELECT options
- Validates MULTI_SELECT options
- Validates numeric ranges
- Validates BOOLEAN type
- Sanitizes text (trim)

### 4. Rate Limiting
- Allows requests within limit
- Rejects requests exceeding limit
- Independent key tracking

### 5. WhatsApp URL Generation
- Valid wa.me URL format
- URL-encodes message
- Replaces {serviceName} placeholder
- Rejects invalid phone numbers
