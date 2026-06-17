ALTER TABLE "feedbacks"
  ADD COLUMN "contactPhone" VARCHAR(20);

CREATE INDEX "feedbacks_contactPhone_idx" ON "feedbacks"("contactPhone");
