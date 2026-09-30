-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN "aiModel" TEXT NOT NULL DEFAULT 'pasted';

-- AlterTable
ALTER TABLE "EvaluationPayout" ADD COLUMN "amountSats" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "EvaluationPayout" ADD COLUMN "destination" TEXT NOT NULL DEFAULT '';
ALTER TABLE "EvaluationPayout" ADD COLUMN "invoice" TEXT NOT NULL DEFAULT '';
ALTER TABLE "EvaluationPayout" ADD COLUMN "paymentHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "EvaluationPayout" ADD COLUMN "settledAt" TIMESTAMP(3);
