import { prisma } from "@/lib/prisma"
import { getLightningService } from "@/services/lightning"

export async function payWorkerForSubmission(submissionId: string) {
  const existing = await prisma.payment.findUnique({
    where: { submissionId },
    include: { lightningPayment: true },
  })
  if (existing?.status === "SENT") return existing

  const submission = await prisma.taskSubmission.findUnique({
    where: { id: submissionId },
    include: { task: true, worker: true },
  })
  if (!submission) throw new Error("Submission not found")
  if (submission.status !== "APPROVED") {
    throw new Error("Only approved submissions can be paid")
  }

  const destination =
    submission.worker.lightningAddress?.trim() ||
    `${submission.worker.id.slice(-6)}@demo.taska`

  const lightning = getLightningService()
  const invoice = await lightning.createInvoice({
    amountSats: submission.task.rewardSats,
    memo: `Taska · ${submission.task.title}`,
    destination,
  })
  const paid = await lightning.payInvoice({
    invoice: invoice.invoice,
    amountSats: submission.task.rewardSats,
  })
  if (paid.status !== "PAID") {
    throw new Error("Lightning payment was not completed")
  }

  return prisma.payment.create({
    data: {
      workerId: submission.workerId,
      submissionId: submission.id,
      amountSats: submission.task.rewardSats,
      paymentMethod: "LIGHTNING",
      paymentReference: paid.paymentHash,
      status: "SENT",
      lightningPayment: {
        create: {
          invoice: invoice.invoice,
          paymentHash: paid.paymentHash,
          destination,
          amountSats: submission.task.rewardSats,
          status: "PAID",
        },
      },
    },
    include: { lightningPayment: true },
  })
}
