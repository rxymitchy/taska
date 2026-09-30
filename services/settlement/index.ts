import { prisma } from "@/lib/prisma"
import { getLightningService } from "@/services/lightning"
import type { Role } from "@prisma/client"

export type ValidatedPayout = {
  evaluationId: string
  workerUserId: string
  reviewerUserId: string
}

function payoutSats(role: Role) {
  if (role === "ADMIN") return Math.max(1, Number(process.env.REVIEWER_PAYOUT_SATS || 200))
  return Math.max(1, Number(process.env.EVALUATOR_PAYOUT_SATS || 500))
}

/**
 * Pays the evaluator and reviewer over Lightning after approval.
 * Uses LIGHTNING_PROVIDER (mock by default). Invoices that start with lnmock1
 * do not move bitcoin. A failed pay leaves the evaluation Completed.
 *
 * Input: the validated evaluation and the two user ids to pay.
 * Output: payout rows PENDING → SENT or FAILED, with invoice and payment hash.
 * Connects at decideEvaluation() after status becomes COMPLETED.
 */
export async function recordPendingLightningPayouts(input: ValidatedPayout) {
  const worker = await prisma.workerProfile.findUnique({ where: { userId: input.workerUserId } })
  const destinations: { role: Role; userId: string; destination: string; amountSats: number }[] = [
    {
      role: "WORKER",
      userId: input.workerUserId,
      destination: worker?.lightningAddress?.trim() || `evaluator@taska.demo`,
      amountSats: payoutSats("WORKER"),
    },
    {
      role: "ADMIN",
      userId: input.reviewerUserId,
      destination: process.env.REVIEWER_LIGHTNING_ADDRESS?.trim() || `reviewer@taska.demo`,
      amountSats: payoutSats("ADMIN"),
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
      const created = await lightning.createInvoice({
        amountSats: payout.amountSats,
        memo: `Taska ${payout.payeeRole.toLowerCase()} ${input.evaluationId}`,
        destination: payout.destination,
      })
      const paid = await lightning.payInvoice({
        invoice: created.invoice,
        amountSats: payout.amountSats,
      })
      const sent = paid.status === "PAID"
      await prisma.evaluationPayout.update({
        where: { id: payout.id },
        data: {
          invoice: created.invoice,
          paymentHash: paid.paymentHash || created.paymentHash,
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
