# Security

## Authentication

### Admin
- Auth.js Credentials provider with bcrypt password hashing (12 rounds)
- Session stored as signed JWT in HTTP-only, Secure cookie
- Cookie flags: `httpOnly`, `secure`, `sameSite: 'lax'`

### Visitor
- Lightweight JWT signed with `AUTH_SECRET`
- Stored in HTTP-only cookie (`mv-visitor-session`)
- No password — registration by mobile number
- Designed for future OTP/2FA upgrade

## Authorization

| Resource | PUBLIC | REGISTERED | ADMIN |
|---|---|---|---|
| Browse properties | ✅ (limited fields) | ✅ (full fields) | ✅ (all + metadata) |
| Registration | ✅ | — | — |
| Submit consultation | ✅ | ✅ | — |
| Service WhatsApp | ✅ | ✅ | — |
| Push subscribe | ✅ | ✅ | — |
| CRUD operations | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | ✅ |

## Rate Limiting

| Endpoint Group | Rate | Window |
|---|---|---|
| Registration | 5 requests | 60 seconds |
| Standard (consultation, contact) | 30 requests | 60 seconds |
| Public browsing | 60 requests | 60 seconds |

Rate limiting is per-IP (in-memory). Designed for Redis upgrade.

## Input Validation

- All inputs validated with Zod before processing
- Dynamic field values validated against `PropertyFieldDefinition` rules
- WhatsApp URLs are always server-generated (never user-supplied)
- File uploads validated by MIME type and size before Cloudinary upload

## Data Protection

- **Gated fields**: Size, location, custom fields (configurable per-field)
- **Anonymous users**: Never see gated field values in API responses
- **Admin-only**: Owner contacts, internal metadata, audit logs
- **Serializers enforce access levels** — no accidental data leakage

## Headers

All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (via Next.js config)
- `Strict-Transport-Security` (via Nginx)

## Secrets Management

- Environment variables validated at startup (Zod)
- Missing required vars → application crashes immediately
- Secrets redacted from structured logs
- `.env` never committed to git (`.gitignore`)

## Audit Trail

All admin actions are logged to `AuditLog`:
- Who (admin ID)
- What (action + entity)
- When (timestamp)
- Where (IP address)
- Context (user agent)
- Metadata (changed fields)

Audit log creation is non-throwing — failures don't break business operations.

## OWASP Alignment

| Threat | Mitigation |
|---|---|
| Injection | Prisma parameterized queries, Zod validation |
| Broken Auth | bcrypt, HTTP-only cookies, signed JWTs |
| Data Exposure | Three-tier serialization, access control |
| CSRF | SameSite cookie + Auth.js CSRF protection |
| Rate Abuse | IP-based rate limiting |
| Dependency Vulns | Regular `npm audit` |
