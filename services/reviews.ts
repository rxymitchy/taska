import { prisma } from "@/lib/prisma"
import { payWorkerForSubmission } from "@/services/payments"
import { refreshWorkerStats } from "@/services/stats"

export async function approveSubmission(submissionId: string, qualityScore: number) {
  if (!Number.isInteger(qualityScore) || qualityScore < 0 || qualityScore > 100) {
    throw new Error("Quality score must be a whole number from 0 to 100")
  }

  const claimed = await prisma.taskSubmission.updateMany({
    where: { id: submissionId, status: "PENDING" },
    data: {
      status: "APPROVED",
      qualityScore,
      reviewedAt: new Date(),
    },
  })
  if (claimed.count !== 1) {
    throw new Error("This submission is no longer waiting for review")
  }

  const submission = await prisma.taskSubmission.findUnique({
    where: { id: submissionId },
    include: { task: true },
  })
  if (!submission) throw new Error("Submission not found")

  try {
    const payment = await payWorkerForSubmission(submissionId)
    const updated = await prisma.task.update({
      where: { id: submission.taskId },
      data: { completedQuantity: { increment: 1 } },
    })
    if (updated.completedQuantity >= updated.quantity) {
      await prisma.task.update({
        where: { id: updated.id },
        data: { status: "CLOSED" },
      })
    }
    await refreshWorkerStats(submission.workerId)
    return payment
  } catch (error) {
    const payment = await prisma.payment.findUnique({ where: { submissionId } })
    if (!payment) {
      await prisma.taskSubmission.update({
        where: { id: submissionId },
        data: { status: "PENDING", qualityScore: null, reviewedAt: null },
      })
    }
    throw error
  }
}

export async function rejectSubmission(submissionId: string) {
  const claimed = await prisma.taskSubmission.updateMany({
    where: { id: submissionId, status: "PENDING" },
    data: { status: "REJECTED", reviewedAt: new Date() },
  })
  if (claimed.count !== 1) {
    throw new Error("This submission is no longer waiting for review")
  }
  const submission = await prisma.taskSubmission.findUnique({
    where: { id: submissionId },
    select: { workerId: true },
  })
  if (submission) await refreshWorkerStats(submission.workerId)
}
