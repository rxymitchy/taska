import { prisma } from "@/lib/prisma"
import { evaluatorPayoutSats, reviewerPayoutSats } from "@/lib/pricing"
import { getLightningService } from "@/services/lightning"
import type { Role } from "@prisma/client"

export type ValidatedPayout = {
  evaluationId: string
  workerUserId: string
  reviewerUserId: string
}

/**
 * Pays the evaluator and reviewer over Lightning after approval.
 * Uses LIGHTNING_PROVIDER (mock by default, OpenNode when OPENNODE_API_KEY is set).
 * Lightning addresses are resolved with LNURL-pay. Mock invoices start with lnmock1
 * and do not move bitcoin. A failed pay leaves the evaluation Completed.
 *
 * Input: the validated evaluation and the two user ids to pay.
 * Output: payout rows PENDING → SENT or FAILED, with invoice and payment hash.
 * Connects at decideEvaluation() after status becomes COMPLETED.
 */
export async function recordPendingLightningPayouts(input: ValidatedPayout) {
  const [worker, reviewer] = await Promise.all([
    prisma.workerProfile.findUnique({ where: { userId: input.workerUserId } }),
    prisma.user.findUnique({ where: { id: input.reviewerUserId }, select: { lightningAddress: true } }),
  ])
  const destinations: { role: Role; userId: string; destination: string; amountSats: number }[] = [
    {
      role: "WORKER",
      userId: input.workerUserId,
      destination: worker?.lightningAddress?.trim() || `evaluator@taska.demo`,
      amountSats: evaluatorPayoutSats(),
    },
    {
      role: "ADMIN",
      userId: input.reviewerUserId,
      destination:
        reviewer?.lightningAddress?.trim() ||
        process.env.REVIEWER_LIGHTNING_ADDRESS?.trim() ||
        `reviewer@taska.demo`,
      amountSats: reviewerPayoutSats(),
    },
  ]

  await prisma.evaluationPayout.createMany({
    data: destinations.map((row) => ({
      evaluationId: input.evaluationId,
      payeeRole: row.role,
      payeeUserId: row.userId,
      rail: "LIGHTNING",
      amountSats: row.amountSats,
      destination: row.destination,
      status: "PENDING",
    })),
    skipDuplicates: true,
  })

  const pending = await prisma.evaluationPayout.findMany({
    where: { evaluationId: input.evaluationId, status: "PENDING" },
  })
  const lightning = getLightningService()

  for (const payout of pending) {
    try {
      const paid = await lightning.payDestination(
        payout.destination,
        payout.amountSats,
        `Taska ${payout.payeeRole.toLowerCase()} ${input.evaluationId}`,
      )
      const sent = paid.status === "PAID"
      await prisma.evaluationPayout.update({
        where: { id: payout.id },
        data: {
          invoice: paid.invoice,
          paymentHash: paid.paymentHash,
          status: sent ? "SENT" : "FAILED",
          settledAt: new Date(),
        },
      })
    } catch {
      await prisma.evaluationPayout.update({
        where: { id: payout.id },
        data: { status: "FAILED", settledAt: new Date() },
      })
    }
  }
}
