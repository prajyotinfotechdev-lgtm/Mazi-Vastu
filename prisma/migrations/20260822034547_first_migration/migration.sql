-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SOLD', 'RENTED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SizeUnit" AS ENUM ('SQFT', 'SQMT', 'ACRE', 'HECTARE', 'GUNTHA');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('FIXED', 'NEGOTIABLE', 'ON_REQUEST', 'PER_SQFT', 'PER_MONTH');

-- CreateEnum
CREATE TYPE "FieldDataType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT', 'DATE');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('REGISTRATION', 'CONSULTATION', 'SERVICE_CONTACT', 'PROPERTY_INTEREST');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ConsultationStatus" AS ENUM ('NEW', 'CONTACTED', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "AdvertisementStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PlacementZone" AS ENUM ('HOMEPAGE_BANNER', 'CATEGORY_PAGE_SLOT', 'SIDEBAR', 'FOOTER_STRIP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "propertyTypeId" TEXT NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "approximateLocation" TEXT,
    "gatedLocation" TEXT,
    "size" DOUBLE PRECISION,
    "sizeUnit" "SizeUnit",
    "price" DOUBLE PRECISION,
    "priceType" "PriceType" DEFAULT 'FIXED',
    "metadata" JSONB DEFAULT '{}',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_slug_history" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "oldSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_slug_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "property_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_field_definitions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "dataType" "FieldDataType" NOT NULL,
    "options" JSONB,
    "validationRules" JSONB,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isGated" BOOLEAN NOT NULL DEFAULT false,
    "isFilterable" BOOLEAN NOT NULL DEFAULT false,
    "isSearchable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "property_field_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_media" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "registrationSource" TEXT NOT NULL DEFAULT 'WEB',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "source" "LeadSource" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "propertyId" TEXT,
    "serviceId" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultation_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "wantedPropertyType" TEXT,
    "wantedPropertySize" TEXT,
    "wantedPropertyLocation" TEXT,
    "budget" TEXT,
    "status" "ConsultationStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allied_services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "whatsappNumber" TEXT NOT NULL,
    "whatsappMessageTemplate" TEXT NOT NULL DEFAULT 'Hello, I am interested in the {serviceName} service from MaziVastu.',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "allied_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "projectInformation" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "status" "AdvertisementStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisement_media" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertisement_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisement_placements" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "placementZone" "PlacementZone" NOT NULL,
    "pageContext" TEXT,
    "categoryContext" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertisement_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSuccessAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_outbox" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "lastAttemptAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "properties_slug_key" ON "properties"("slug");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_propertyTypeId_idx" ON "properties"("propertyTypeId");

-- CreateIndex
CREATE INDEX "properties_publishedAt_idx" ON "properties"("publishedAt");

-- CreateIndex
CREATE INDEX "properties_slug_idx" ON "properties"("slug");

-- CreateIndex
CREATE INDEX "properties_deletedAt_idx" ON "properties"("deletedAt");

-- CreateIndex
CREATE INDEX "properties_status_deletedAt_publishedAt_idx" ON "properties"("status", "deletedAt", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "property_slug_history_oldSlug_key" ON "property_slug_history"("oldSlug");

-- CreateIndex
CREATE INDEX "property_slug_history_oldSlug_idx" ON "property_slug_history"("oldSlug");

-- CreateIndex
CREATE UNIQUE INDEX "property_types_slug_key" ON "property_types"("slug");

-- CreateIndex
CREATE INDEX "property_types_parentId_idx" ON "property_types"("parentId");

-- CreateIndex
CREATE INDEX "property_types_isActive_sortOrder_idx" ON "property_types"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "property_types_slug_idx" ON "property_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "property_field_definitions_key_key" ON "property_field_definitions"("key");

-- CreateIndex
CREATE INDEX "property_field_definitions_isActive_sortOrder_idx" ON "property_field_definitions"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "property_field_definitions_key_idx" ON "property_field_definitions"("key");

-- CreateIndex
CREATE INDEX "property_media_propertyId_sortOrder_idx" ON "property_media"("propertyId", "sortOrder");

-- CreateIndex
CREATE INDEX "visitors_email_idx" ON "visitors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "visitors_mobile_key" ON "visitors"("mobile");

-- CreateIndex
CREATE INDEX "leads_source_idx" ON "leads"("source");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE INDEX "leads_visitorId_idx" ON "leads"("visitorId");

-- CreateIndex
CREATE INDEX "consultation_requests_status_idx" ON "consultation_requests"("status");

-- CreateIndex
CREATE INDEX "consultation_requests_createdAt_idx" ON "consultation_requests"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "allied_services_slug_key" ON "allied_services"("slug");

-- CreateIndex
CREATE INDEX "allied_services_isActive_sortOrder_idx" ON "allied_services"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "allied_services_slug_idx" ON "allied_services"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "advertisements_slug_key" ON "advertisements"("slug");

-- CreateIndex
CREATE INDEX "advertisements_status_idx" ON "advertisements"("status");

-- CreateIndex
CREATE INDEX "advertisements_startDate_idx" ON "advertisements"("startDate");

-- CreateIndex
CREATE INDEX "advertisements_endDate_idx" ON "advertisements"("endDate");

-- CreateIndex
CREATE INDEX "advertisements_slug_idx" ON "advertisements"("slug");

-- CreateIndex
CREATE INDEX "advertisements_deletedAt_idx" ON "advertisements"("deletedAt");

-- CreateIndex
CREATE INDEX "advertisements_status_deletedAt_startDate_endDate_idx" ON "advertisements"("status", "deletedAt", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "advertisement_media_advertisementId_sortOrder_idx" ON "advertisement_media"("advertisementId", "sortOrder");

-- CreateIndex
CREATE INDEX "advertisement_placements_placementZone_idx" ON "advertisement_placements"("placementZone");

-- CreateIndex
CREATE INDEX "advertisement_placements_advertisementId_idx" ON "advertisement_placements"("advertisementId");

-- CreateIndex
CREATE UNIQUE INDEX "advertisement_placements_advertisementId_placementZone_page_key" ON "advertisement_placements"("advertisementId", "placementZone", "pageContext", "categoryContext");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_visitorId_idx" ON "push_subscriptions"("visitorId");

-- CreateIndex
CREATE INDEX "push_subscriptions_isActive_idx" ON "push_subscriptions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "notification_outbox_idempotencyKey_key" ON "notification_outbox"("idempotencyKey");

-- CreateIndex
CREATE INDEX "notification_outbox_status_createdAt_idx" ON "notification_outbox"("status", "createdAt");

-- CreateIndex
CREATE INDEX "notification_outbox_idempotencyKey_idx" ON "notification_outbox"("idempotencyKey");

-- CreateIndex
CREATE INDEX "audit_logs_adminId_idx" ON "audit_logs"("adminId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_propertyTypeId_fkey" FOREIGN KEY ("propertyTypeId") REFERENCES "property_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_slug_history" ADD CONSTRAINT "property_slug_history_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_types" ADD CONSTRAINT "property_types_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "property_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_media" ADD CONSTRAINT "property_media_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_media" ADD CONSTRAINT "advertisement_media_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_placements" ADD CONSTRAINT "advertisement_placements_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "visitors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
