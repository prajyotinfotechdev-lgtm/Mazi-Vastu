# API Reference

All endpoints return JSON. Error responses follow the format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

## Authentication

- **Admin**: Auth.js session (JWT cookie `__Secure-next-auth.session-token`)
- **Visitor**: Signed JWT cookie (`mv-visitor-session`)
- **Public**: No auth required

---

## Health

### `GET /api/health`
**Auth**: None

**Response** `200`:
```json
{ "status": "ok", "timestamp": "2026-08-21T00:00:00.000Z" }
```

---

## Public — Properties

### `GET /api/public/properties`
**Auth**: None (PUBLIC) | Visitor cookie (REGISTERED)

**Query Params**:
| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `pageSize` | number | Items per page (default: 20, max: 100) |
| `propertyTypeId` | string | Filter by property type |
| `q` | string | Search in title/description |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |

**Response** `200`:
```json
{
  "items": [{ "id": "...", "slug": "...", "title": "...", ... }],
  "pagination": { "page": 1, "pageSize": 20, "total": 100, "totalPages": 5 }
}
```

> **Note**: Anonymous users do NOT receive `gatedLocation`, `size`, `sizeUnit`, or gated custom fields.

### `GET /api/public/properties/{slug}`
**Auth**: None | Visitor

**Response** `200`: Property detail (fields filtered by access level)
**Response** `301`: `{ "redirect": "/properties/new-slug" }` (slug changed)
**Response** `404`: Property not found

---

## Public — Registration

### `POST /api/public/register`
**Auth**: None | **Rate limit**: 5/min

**Body**:
```json
{
  "name": "John Doe",
  "mobile": "9876543210",
  "email": "john@example.com",
  "language": "en"
}
```

**Response** `201` (new) / `200` (existing):
```json
{
  "success": true,
  "visitor": { "id": "...", "name": "John Doe", "isNew": true }
}
```

Sets `mv-visitor-session` cookie.

---

## Public — Consultation

### `POST /api/public/consultation`
**Auth**: None | **Rate limit**: 30/min

**Body**:
```json
{
  "name": "Jane Doe",
  "phone": "9876543210",
  "email": "jane@example.com",
  "wantedPropertyType": "Flat",
  "wantedPropertySize": "1000 sqft",
  "wantedPropertyLocation": "Pune",
  "budget": "50-70 Lakhs"
}
```

**Response** `201`:
```json
{
  "success": true,
  "consultationId": "...",
  "message": "Your consultation request has been submitted successfully."
}
```

---

## Public — Services

### `GET /api/public/services`
**Auth**: None

**Response** `200`: List of active allied services

### `POST /api/public/services/{id}/contact`
**Auth**: None | Visitor | **Rate limit**: 30/min

**Body** (optional):
```json
{ "name": "John", "phone": "9876543210" }
```

**Response** `200`:
```json
{ "whatsappUrl": "https://wa.me/919876543210?text=..." }
```

---

## Public — Advertisements

### `GET /api/public/advertisements`
**Auth**: None

**Query Params**:
| Param | Type | Description |
|---|---|---|
| `placement` | enum | `HOMEPAGE_BANNER`, `CATEGORY_PAGE_SLOT`, `SIDEBAR`, `FOOTER_STRIP` |
| `pageContext` | string | Specific page path |
| `categoryContext` | string | Specific category slug |
| `page` | number | Page number |
| `pageSize` | number | Items per page |

> Only returns ads where `status=ACTIVE AND now >= startDate AND now <= endDate AND deletedAt IS NULL`

### `GET /api/public/advertisements/{slug}`
**Auth**: None

---

## Public — Property Types & Fields

### `GET /api/public/property-types`
**Auth**: None — Returns hierarchical active types

### `GET /api/public/property-fields`
**Auth**: None — Returns public field definitions (for filters)

---

## Push Notifications

### `POST /api/push/subscribe`
**Auth**: None | Visitor | **Rate limit**: 30/min

**Body**:
```json
{
  "endpoint": "https://fcm.googleapis.com/...",
  "keys": { "p256dh": "...", "auth": "..." }
}
```

### `DELETE /api/push/subscribe`
**Body**: `{ "endpoint": "https://..." }`

---

## Admin — Properties

All admin endpoints require Auth.js session.

### `GET /api/admin/properties`
### `POST /api/admin/properties`
### `GET /api/admin/properties/{id}`
### `PUT /api/admin/properties/{id}`
### `DELETE /api/admin/properties/{id}` — Archives (soft delete)
### `POST /api/admin/properties/{id}/publish`

---

## Admin — Property Types

### `GET /api/admin/property-types`
### `POST /api/admin/property-types`
### `PUT /api/admin/property-types/{id}`
### `DELETE /api/admin/property-types/{id}`

---

## Admin — Custom Fields

### `GET /api/admin/custom-fields`
### `POST /api/admin/custom-fields`
### `PUT /api/admin/custom-fields/{id}`
### `DELETE /api/admin/custom-fields/{id}`

---

## Admin — Advertisements

### `GET /api/admin/advertisements`
### `POST /api/admin/advertisements`
### `GET /api/admin/advertisements/{id}`
### `PUT /api/admin/advertisements/{id}`
### `DELETE /api/admin/advertisements/{id}` — Archives
### `POST /api/admin/advertisements/{id}/activate`
### `POST /api/admin/advertisements/{id}/deactivate`
### `PUT /api/admin/advertisements/{id}/placements`

**Placements Body**:
```json
{
  "placements": [
    { "placementZone": "HOMEPAGE_BANNER", "sortOrder": 0 },
    { "placementZone": "SIDEBAR", "sortOrder": 1 }
  ]
}
```

---

## Admin — Services

### `GET /api/admin/services`
### `POST /api/admin/services`
### `PUT /api/admin/services/{id}`
### `DELETE /api/admin/services/{id}`

---

## Admin — Leads

### `GET /api/admin/leads` — Filter by source, status, search
### `GET /api/admin/leads/{id}`
### `PUT /api/admin/leads/{id}` — Update status, notes

---

## Admin — Consultations

### `GET /api/admin/consultations`
### `GET /api/admin/consultations/{id}`
### `PUT /api/admin/consultations/{id}`

---

## Admin — Media

### `POST /api/admin/media` — Request signed upload params
### `POST /api/admin/media?action=confirm` — Confirm upload
### `DELETE /api/admin/media/{id}?type=property|advertisement`

---

## Admin — Audit Logs

### `GET /api/admin/audit-logs` — Filter by action, entity, date

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 301 | Redirect (slug change) |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limited |
| 500 | Internal error |
| 503 | Service unavailable |
