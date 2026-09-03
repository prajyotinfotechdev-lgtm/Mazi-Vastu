# MaziVastu — Property Listing Backend

Production-grade MVP backend for the MaziVastu property listing platform.

## Tech Stack

- **Runtime**: Next.js 14+ App Router (TypeScript)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js (Credentials provider, bcrypt)
- **Media**: Cloudinary (images + videos)
- **Push**: Web Push / VAPID
- **Validation**: Zod
- **i18n**: next-intl (English + Marathi)
- **PWA**: Service worker + manifest
- **Testing**: Vitest + Playwright

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
- Cloudinary account
- VAPID keys (generate with `npx web-push generate-vapid-keys`)

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd majhi-vastu
npm install

# 2. Start PostgreSQL with Docker
docker run --name majivastu-db \
  -e POSTGRES_DB=majhi_vastu \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Run migrations and seed
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev
```

### Verify

```bash
# Health check
curl http://localhost:3000/api/health

# List property types
curl http://localhost:3000/api/public/property-types
```

## Project Structure

```
src/
  app/api/           # Next.js API routes (thin handlers)
    admin/           # Admin-only endpoints
    public/          # Public endpoints
    push/            # Push subscription
    health/          # Health check
  modules/           # Business logic modules
    auth/            # Admin auth
    properties/      # Property CRUD, publishing, access control
    property-types/  # Hierarchical property types
    custom-fields/   # Dynamic field definitions + validation
    media/           # Cloudinary media management
    visitors/        # Visitor registration
    leads/           # Lead capture
    consultations/   # Consultation requests
    notifications/   # Web Push + outbox
    services/        # Allied services + WhatsApp
    advertisements/  # Independent ad module
    audit/           # Audit logging
    seo/             # SEO utilities
  lib/               # Shared infrastructure
    auth/            # Auth.js config + middleware
    config/          # Environment config
    db/              # Prisma client
    errors/          # Typed errors
    logging/         # Structured logger
    security/        # Rate limiter
    storage/         # Cloudinary provider
    validation/      # Shared Zod schemas
prisma/
  schema.prisma      # Database schema (17 models)
  seed.ts            # Seed data
  migrations/        # Versioned migrations
```

## Key Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests |
| `npm run test:all` | All checks |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Prisma Studio |

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security](docs/SECURITY.md)
- [Testing](docs/TESTING.md)
- [Assumptions](docs/ASSUMPTIONS.md)
- [Backup & Recovery](docs/BACKUP.md)

## License

Private — All rights reserved.
