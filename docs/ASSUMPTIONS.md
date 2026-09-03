# Assumptions

This document records design decisions where the BRD was ambiguous or silent.
Each assumption notes the BRD section it relates to and the fallback behavior.

## Architectural Assumptions

1. **Single-admin for MVP** — Only one admin user is needed initially. Multi-admin support is designed in (schema supports it) but the seed creates a single admin. (BRD §3)

2. **In-memory rate limiting** — Rate limiters use in-memory storage (suitable for single-process VPS). No Redis dependency for MVP. Designed with an interface that supports future Redis swap. (BRD §27)

3. **No OTP for MVP** — Visitor registration uses mobile number without OTP verification. The schema and service layer are designed to support OTP addition without breaking changes. (BRD §12)

4. **PostgreSQL outbox for notifications** — Web Push uses a PostgreSQL-backed outbox processed in-process rather than a separate worker. Notification failures never roll back business operations. (BRD §21)

5. **Client-side direct upload** — Media uploads go directly to Cloudinary from the browser using signed parameters. The backend generates signed params and confirms uploads. No binary data passes through the Next.js server. (BRD §18)

## Business Logic Assumptions

6. **Property slug redirect** — When a property title changes, the old slug is preserved in `PropertySlugHistory`. Public API returns `301` redirect to the new slug for SEO. (BRD §25)

7. **Advertisement time-window** — Ads are eligible when `status=ACTIVE AND now >= startDate AND now <= endDate`. No cron job needed — eligibility is computed at query time. (BRD §53)

8. **Lead deduplication** — Visitors are deduped by mobile number. Re-registration with the same mobile updates the record and re-issues the session. A new registration lead is NOT created for returning visitors. (BRD §11)

9. **Consultation creates lead** — Every consultation submission also creates a Lead entry for the admin dashboard. The admin sees all interest in one place. (BRD §17)

10. **WhatsApp URL is server-generated** — Users never provide arbitrary WhatsApp URLs. The backend constructs validated `wa.me` links from stored admin phone numbers and templates. (BRD §20)

## Data Model Assumptions

11. **Soft delete vs hard delete** — Properties, PropertyTypes, FieldDefinitions, Services, and Advertisements use soft delete (`deletedAt`). Leads, ConsultationRequests, and AuditLogs are never deleted. (BRD §7)

12. **JSONB for metadata** — Dynamic field values are stored as JSONB in `Property.metadata`. Full-text search on JSONB values is not supported in MVP; only predefined filterable fields support query filters. (BRD §9)

13. **SizeUnit enum** — Size units are limited to: SQFT, SQMT, ACRE, HECTARE, GUNTHA. Additional units require a schema migration. (BRD §8)

14. **PlacementZone enum** — Ad placement zones are limited to: HOMEPAGE_BANNER, CATEGORY_PAGE_SLOT, SIDEBAR, FOOTER_STRIP. Additional zones require a schema migration. (BRD §53)

15. **Property types are hierarchical** — The `parentId` relationship supports one level of nesting (parent → children). Deeper nesting is not prevented by schema but not tested. (BRD §6)
