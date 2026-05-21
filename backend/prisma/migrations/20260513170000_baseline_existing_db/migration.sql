CREATE TYPE "FeedbackStatus" AS ENUM ('PENDING', 'PROCESSING', 'TRANSFERRED', 'RESOLVED');
CREATE TYPE "FeedbackCategory" AS ENUM ('HA_TANG', 'VE_SINH', 'TRAT_TU', 'AN_NINH', 'KHAC');
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "BookingField" AS ENUM ('HO_TICH', 'CU_TRU', 'CHUNG_THUC', 'DAT_DAI', 'XA_HOI', 'KHAC');

CREATE TABLE "oa_tokens" (
  "id" TEXT NOT NULL,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ(6) NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "oa_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "zaloId" VARCHAR(64) NOT NULL,
  "displayName" VARCHAR(255) NOT NULL,
  "phoneToken" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_zaloId_key" ON "users"("zaloId");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt" DESC);
CREATE INDEX "users_zaloId_idx" ON "users"("zaloId");

CREATE TABLE "bookings" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(20) NOT NULL,
  "userId" TEXT NOT NULL,
  "field" "BookingField" NOT NULL,
  "preferredDate" TIMESTAMPTZ(6) NOT NULL,
  "preferredTime" VARCHAR(5) NOT NULL,
  "confirmedDate" TIMESTAMPTZ(6),
  "confirmedTime" VARCHAR(5),
  "description" TEXT NOT NULL,
  "contactName" VARCHAR(100) NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
  "rejectionReason" TEXT,
  "rescheduledNote" TEXT,
  "reminder24hSent" BOOLEAN NOT NULL DEFAULT false,
  "reminder1hSent" BOOLEAN NOT NULL DEFAULT false,
  "oaMessageId" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "bookings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "bookings_code_key" ON "bookings"("code");
CREATE INDEX "bookings_createdAt_idx" ON "bookings"("createdAt" DESC);
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");
CREATE INDEX "bookings_userId_status_idx" ON "bookings"("userId", "status");

CREATE TABLE "feedbacks" (
  "id" TEXT NOT NULL,
  "code" VARCHAR(20) NOT NULL,
  "userId" TEXT NOT NULL,
  "title" VARCHAR(100) NOT NULL,
  "category" "FeedbackCategory" NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "address" TEXT,
  "status" "FeedbackStatus" NOT NULL DEFAULT 'PENDING',
  "response" TEXT,
  "respondedAt" TIMESTAMPTZ(6),
  "oaMessageId" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "feedbacks_code_key" ON "feedbacks"("code");
CREATE INDEX "feedbacks_createdAt_idx" ON "feedbacks"("createdAt" DESC);
CREATE INDEX "feedbacks_status_idx" ON "feedbacks"("status");
CREATE INDEX "feedbacks_userId_idx" ON "feedbacks"("userId");
CREATE INDEX "feedbacks_userId_status_idx" ON "feedbacks"("userId", "status");

CREATE TABLE "ratings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "procedure" VARCHAR(100) NOT NULL,
  "attitudeScore" SMALLINT NOT NULL,
  "timelinessScore" SMALLINT NOT NULL,
  "outcomeScore" SMALLINT NOT NULL,
  "averageScore" DECIMAL(3,1) NOT NULL,
  "comment" TEXT,
  "alertSent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ratings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "ratings_avgScore_idx" ON "ratings"("averageScore");
CREATE INDEX "ratings_createdAt_idx" ON "ratings"("createdAt" DESC);
CREATE INDEX "ratings_userId_idx" ON "ratings"("userId");

CREATE TABLE "articles" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "content" TEXT,
  "thumbnailUrl" TEXT,
  "category" VARCHAR(50) NOT NULL DEFAULT 'Tin tức',
  "publishedAt" TIMESTAMPTZ(6) NOT NULL,
  "author" VARCHAR(100) DEFAULT 'Admin',
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "articles_publishedAt_idx" ON "articles"("publishedAt" DESC);
