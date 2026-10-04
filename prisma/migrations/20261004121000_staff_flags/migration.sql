ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isReviewer" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User" SET "isAdmin" = true, "isReviewer" = true WHERE "role" = 'ADMIN';

ALTER TABLE "Evaluation" ADD COLUMN IF NOT EXISTS "reviewerUserId" TEXT;
ALTER TABLE "Evaluation" ADD COLUMN IF NOT EXISTS "reviewerAssignedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Evaluation_reviewerUserId_idx" ON "Evaluation"("reviewerUserId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Evaluation_reviewerUserId_fkey'
  ) THEN
    ALTER TABLE "Evaluation"
      ADD CONSTRAINT "Evaluation_reviewerUserId_fkey"
      FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "ReviewerInvite" ADD COLUMN IF NOT EXISTS "staffKind" TEXT NOT NULL DEFAULT 'reviewer';
