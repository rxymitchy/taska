-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING', 'ASSIGNED', 'WORKER_COMPLETED', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "aiResponse" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "assignedWorkerId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationSubmission" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "factuallyCorrect" BOOLEAN NOT NULL,
    "languageNatural" BOOLEAN NOT NULL,
    "understandsContext" BOOLEAN NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewerUserId" TEXT,

    CONSTRAINT "EvaluationSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationPayout" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "payeeRole" "Role" NOT NULL,
    "payeeUserId" TEXT NOT NULL,
    "rail" TEXT NOT NULL DEFAULT 'LIGHTNING',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evaluation_companyId_createdAt_idx" ON "Evaluation"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Evaluation_status_idx" ON "Evaluation"("status");

-- CreateIndex
CREATE INDEX "Evaluation_assignedWorkerId_idx" ON "Evaluation"("assignedWorkerId");

-- CreateIndex
CREATE INDEX "EvaluationSubmission_evaluationId_submittedAt_idx" ON "EvaluationSubmission"("evaluationId", "submittedAt");

-- CreateIndex
CREATE INDEX "EvaluationSubmission_workerId_idx" ON "EvaluationSubmission"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationPayout_evaluationId_payeeRole_key" ON "EvaluationPayout"("evaluationId", "payeeRole");

-- CreateIndex
CREATE INDEX "EvaluationPayout_payeeUserId_idx" ON "EvaluationPayout"("payeeUserId");

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "EmployerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "WorkerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationSubmission" ADD CONSTRAINT "EvaluationSubmission_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationSubmission" ADD CONSTRAINT "EvaluationSubmission_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationPayout" ADD CONSTRAINT "EvaluationPayout_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
