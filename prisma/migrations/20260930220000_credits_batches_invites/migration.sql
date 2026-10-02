-- AlterTable
ALTER TABLE "User" ADD COLUMN "lightningAddress" TEXT;

-- AlterTable
ALTER TABLE "EmployerProfile" ADD COLUMN "prepaidSats" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "EmployerProfile" ADD COLUMN "heldSats" INTEGER NOT NULL DEFAULT 0;

-- CreateEnum
CREATE TYPE "CreditKind" AS ENUM ('DEPOSIT', 'HOLD', 'RELEASE', 'SPEND');

-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN "batchId" TEXT;
ALTER TABLE "Evaluation" ADD COLUMN "heldSats" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "EvaluationBatch" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLedger" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "kind" "CreditKind" NOT NULL,
    "amountSats" INTEGER NOT NULL,
    "evaluationId" TEXT,
    "depositId" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditDeposit" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "amountSats" INTEGER NOT NULL,
    "invoice" TEXT NOT NULL,
    "paymentHash" TEXT NOT NULL,
    "checkoutUrl" TEXT NOT NULL DEFAULT '',
    "status" "LightningStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "CreditDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewerInvite" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewerInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvaluationBatch_companyId_createdAt_idx" ON "EvaluationBatch"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditLedger_companyId_createdAt_idx" ON "CreditLedger"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreditDeposit_paymentHash_key" ON "CreditDeposit"("paymentHash");

-- CreateIndex
CREATE INDEX "CreditDeposit_companyId_createdAt_idx" ON "CreditDeposit"("companyId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewerInvite_tokenHash_key" ON "ReviewerInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "ReviewerInvite_email_idx" ON "ReviewerInvite"("email");

-- CreateIndex
CREATE INDEX "Evaluation_batchId_idx" ON "Evaluation"("batchId");

-- AddForeignKey
ALTER TABLE "EvaluationBatch" ADD CONSTRAINT "EvaluationBatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "EmployerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "EvaluationBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "EmployerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "CreditDeposit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditDeposit" ADD CONSTRAINT "CreditDeposit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "EmployerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
