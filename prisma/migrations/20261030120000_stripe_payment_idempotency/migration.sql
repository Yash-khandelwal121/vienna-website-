-- AlterTable: Add payment columns to Booking with safe defaults
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'UNPAID';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentAmount" DOUBLE PRECISION;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'EUR';
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentTimestamp" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "promoCode" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "childSeatCount" INTEGER DEFAULT 0;

-- CreateIndex: Booking paymentStatus and stripeSessionId indexes
CREATE INDEX IF NOT EXISTS "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");
CREATE INDEX IF NOT EXISTS "Booking_stripeSessionId_idx" ON "Booking"("stripeSessionId");

-- CreateTable: ProcessedWebhookEvent for durable webhook idempotency
CREATE TABLE IF NOT EXISTS "ProcessedWebhookEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "bookingRef" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique and search indexes on ProcessedWebhookEvent
CREATE UNIQUE INDEX IF NOT EXISTS "ProcessedWebhookEvent_eventId_key" ON "ProcessedWebhookEvent"("eventId");
CREATE INDEX IF NOT EXISTS "ProcessedWebhookEvent_eventId_idx" ON "ProcessedWebhookEvent"("eventId");
CREATE INDEX IF NOT EXISTS "ProcessedWebhookEvent_processedAt_idx" ON "ProcessedWebhookEvent"("processedAt");
