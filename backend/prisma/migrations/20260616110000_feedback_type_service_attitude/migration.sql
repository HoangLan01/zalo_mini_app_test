CREATE TYPE "FeedbackType" AS ENUM ('FIELD', 'SERVICE_ATTITUDE');

ALTER TABLE "feedbacks"
  ADD COLUMN "type" "FeedbackType" NOT NULL DEFAULT 'FIELD',
  ADD COLUMN "serviceUnit" VARCHAR(255),
  ADD COLUMN "satisfactionScore" SMALLINT;

CREATE INDEX "feedbacks_type_idx" ON "feedbacks"("type");
