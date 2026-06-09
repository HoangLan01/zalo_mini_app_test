ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';

DO $$ BEGIN
  CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "sessionVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMPTZ(6),
  ADD COLUMN IF NOT EXISTS "createdById" TEXT;

DO $$ BEGIN
  ALTER TABLE "users"
    ADD CONSTRAINT "users_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" VARCHAR(100) NOT NULL,
  "entityType" VARCHAR(100) NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "ipAddress" VARCHAR(100),
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "admin_audit_logs_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "admin_audit_logs_createdAt_idx" ON "admin_audit_logs"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "admin_audit_logs_actorId_createdAt_idx" ON "admin_audit_logs"("actorId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "admin_audit_logs_entityType_entityId_idx" ON "admin_audit_logs"("entityType", "entityId");
