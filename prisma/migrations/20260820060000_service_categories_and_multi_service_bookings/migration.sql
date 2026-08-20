-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('MAIN', 'ADDON');

-- Service: split durationMinutes into a min/max range, add category.
-- Existing services become a fixed-point range (min = max = old value).
ALTER TABLE "Service"
  ADD COLUMN "durationMinMinutes" INTEGER,
  ADD COLUMN "durationMaxMinutes" INTEGER,
  ADD COLUMN "category" "ServiceCategory" NOT NULL DEFAULT 'MAIN';

UPDATE "Service" SET "durationMinMinutes" = "durationMinutes", "durationMaxMinutes" = "durationMinutes";

ALTER TABLE "Service"
  ALTER COLUMN "durationMinMinutes" SET NOT NULL,
  ALTER COLUMN "durationMaxMinutes" SET NOT NULL;

ALTER TABLE "Service" DROP COLUMN "durationMinutes";

-- CreateTable
CREATE TABLE "BookingService" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "BookingService_pkey" PRIMARY KEY ("id")
);

-- Backfill: every existing booking's single service becomes its one
-- BookingService row before the old column is dropped.
INSERT INTO "BookingService" ("id", "bookingId", "serviceId")
SELECT gen_random_uuid()::text, "id", "serviceId" FROM "Booking" WHERE "serviceId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_serviceId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "serviceId";

-- CreateIndex
CREATE UNIQUE INDEX "BookingService_bookingId_serviceId_key" ON "BookingService"("bookingId", "serviceId");

-- CreateIndex
CREATE INDEX "BookingService_serviceId_idx" ON "BookingService"("serviceId");

-- AddForeignKey
ALTER TABLE "BookingService" ADD CONSTRAINT "BookingService_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingService" ADD CONSTRAINT "BookingService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
