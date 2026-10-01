/*
  Warnings:

  - The values [SIDEBAR] on the enum `PlacementZone` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deletedAt` on the `property_types` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlacementZone_new" AS ENUM ('HOMEPAGE_BANNER', 'CATEGORY_PAGE_SLOT', 'SERVICE_PAGE_SLOT', 'FOOTER_STRIP');
ALTER TABLE "advertisement_placements" ALTER COLUMN "placementZone" TYPE "PlacementZone_new" USING ("placementZone"::text::"PlacementZone_new");
ALTER TYPE "PlacementZone" RENAME TO "PlacementZone_old";
ALTER TYPE "PlacementZone_new" RENAME TO "PlacementZone";
DROP TYPE "PlacementZone_old";
COMMIT;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "contactNumber" TEXT,
ALTER COLUMN "size" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "property_types" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "urgent_properties" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'URGENT';
