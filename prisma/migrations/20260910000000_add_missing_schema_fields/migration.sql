-- ============================================================
-- Migration: add_missing_schema_fields
-- Adds fields/tables present in schema.prisma but absent from
-- the first migration (20260822034547_first_migration).
-- ============================================================

-- 1. Add "city" column to properties table
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "city" TEXT;

-- 2. Add "price" and "priceUnit" and "providerContacts" to allied_services
ALTER TABLE "allied_services" ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION;
ALTER TABLE "allied_services" ADD COLUMN IF NOT EXISTS "priceUnit" TEXT;
ALTER TABLE "allied_services" ADD COLUMN IF NOT EXISTS "providerContacts" JSONB DEFAULT '[]';

-- 3. Add "adminId" column to push_subscriptions
ALTER TABLE "push_subscriptions" ADD COLUMN IF NOT EXISTS "adminId" TEXT;

-- AddForeignKey for push_subscriptions.adminId -> admins.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'push_subscriptions_adminId_fkey'
  ) THEN
    ALTER TABLE "push_subscriptions"
      ADD CONSTRAINT "push_subscriptions_adminId_fkey"
      FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex for push_subscriptions.adminId
CREATE INDEX IF NOT EXISTS "push_subscriptions_adminId_idx" ON "push_subscriptions"("adminId");

-- 4. Add SERVICE_PAGE_SLOT to PlacementZone enum (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'SERVICE_PAGE_SLOT'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PlacementZone')
  ) THEN
    ALTER TYPE "PlacementZone" ADD VALUE 'SERVICE_PAGE_SLOT';
  END IF;
END $$;

-- 5. Create urgent_properties table
CREATE TABLE IF NOT EXISTS "urgent_properties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "urgent_properties_pkey" PRIMARY KEY ("id")
);

-- 6. Create site_settings table
CREATE TABLE IF NOT EXISTS "site_settings" (
    "id" TEXT NOT NULL,
    "founderName" TEXT NOT NULL DEFAULT 'Kishor Lavte',
    "founderImage" TEXT,
    "officeAddress" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "disclosure" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "youtubeUrl" TEXT,
    "whatsappUrl" TEXT,
    "linkedinUrl" TEXT,
    "telegramUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
