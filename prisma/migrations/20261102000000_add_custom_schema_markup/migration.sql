-- AlterTable: Add schemaMarkup to DayTrip and SEORecord
ALTER TABLE "DayTrip" ADD COLUMN IF NOT EXISTS "schemaMarkup" TEXT;
ALTER TABLE "SEORecord" ADD COLUMN IF NOT EXISTS "schemaMarkup" TEXT;
