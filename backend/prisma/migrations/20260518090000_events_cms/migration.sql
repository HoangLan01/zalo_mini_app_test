DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EventStatus') THEN
    CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EventCategory') THEN
    CREATE TYPE "EventCategory" AS ENUM ('VAN_HOA', 'THE_THAO', 'HANH_CHINH', 'LE_HOI', 'KHAC');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "events" (
  "id" TEXT NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "category" "EventCategory" NOT NULL DEFAULT 'KHAC',
  "location" VARCHAR(255) NOT NULL,
  "startAt" TIMESTAMPTZ(6) NOT NULL,
  "endAt" TIMESTAMPTZ(6) NOT NULL,
  "organizer" VARCHAR(255) NOT NULL,
  "contactInfo" TEXT,
  "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "thumbnailUrl" TEXT NOT NULL,
  "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
  "order" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMPTZ(6),
  "closedAt" TIMESTAMPTZ(6),
  "archivedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "events_status_archivedAt_startAt_idx" ON "events"("status", "archivedAt", "startAt");
CREATE INDEX IF NOT EXISTS "events_createdAt_idx" ON "events"("createdAt" DESC);
