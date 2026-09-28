-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('WORKER', 'EMPLOYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('FUNDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('AI_RESPONSE_EVALUATION', 'GENERIC');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "LightningStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "skills" TEXT[],
    "languages" TEXT[],
    "cvFileName" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "lightningAddress" TEXT,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "approvalRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyDescription" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "rewardSats" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "completedQuantity" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL,
    "requiredSkills" TEXT[],
    "estimatedMinutes" INTEGER NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'FUNDED',
    "taskType" "TaskType" NOT NULL DEFAULT 'GENERIC',
    "autoApprove" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskItem" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "responseA" TEXT NOT NULL,
    "responseB" TEXT NOT NULL,
    "referenceChoice" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "assignedWorkerId" TEXT,
    "assignedAt" TIMESTAMP(3),

    CONSTRAINT "TaskItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskSubmission" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "taskItemId" TEXT,
    "workerId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "qualityScore" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "TaskSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "amountSats" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'LIGHTNING',
    "paymentReference" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LightningPayment" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoice" TEXT NOT NULL,
    "paymentHash" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "amountSats" INTEGER NOT NULL,
    "status" "LightningStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LightningPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerProfile_userId_key" ON "WorkerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerProfile_userId_key" ON "EmployerProfile"("userId");

-- CreateIndex
CREATE INDEX "Task_status_category_idx" ON "Task"("status", "category");

-- CreateIndex
CREATE INDEX "TaskItem_taskId_status_idx" ON "TaskItem"("taskId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TaskSubmission_taskItemId_key" ON "TaskSubmission"("taskItemId");

-- CreateIndex
CREATE INDEX "TaskSubmission_workerId_submittedAt_idx" ON "TaskSubmission"("workerId", "submittedAt");

-- CreateIndex
CREATE INDEX "TaskSubmission_status_idx" ON "TaskSubmission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_submissionId_key" ON "Payment"("submissionId");

-- CreateIndex
CREATE INDEX "Payment_workerId_createdAt_idx" ON "Payment"("workerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LightningPayment_paymentId_key" ON "LightningPayment"("paymentId");

-- AddForeignKey
ALTER TABLE "WorkerProfile" ADD CONSTRAINT "WorkerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "EmployerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItem" ADD CONSTRAINT "TaskItem_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskItem" ADD CONSTRAINT "TaskItem_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "WorkerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSubmission" ADD CONSTRAINT "TaskSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSubmission" ADD CONSTRAINT "TaskSubmission_taskItemId_fkey" FOREIGN KEY ("taskItemId") REFERENCES "TaskItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskSubmission" ADD CONSTRAINT "TaskSubmission_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "TaskSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LightningPayment" ADD CONSTRAINT "LightningPayment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

