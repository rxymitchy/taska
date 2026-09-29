import { prisma } from "@/lib/prisma"

export type ValidatedPayout = {
  evaluationId: string
  workerUserId: string
  reviewerUserId: string
}

/**
 * Teammate A owns real settlement.
 *
 * Input: the validated evaluation and the two user ids to pay.
 * Processing: create Lightning invoices and pay them.
 * Output: payout rows moving from PENDING to SENT or FAILED.
 * Connects at approveEvaluation(), which only records Lightning — Pending.
 *
 * Do not call this from the company or evaluator forms.
 * The core flow stays complete when this function only writes PENDING.
 */
export async function recordPendingLightningPayouts(input: ValidatedPayout) {
  await prisma.evaluationPayout.createMany({
    data: [
      { evaluationId: input.evaluationId, payeeRole: "WORKER", payeeUserId: input.workerUserId, rail: "LIGHTNING", status: "PENDING" },
      { evaluationId: input.evaluationId, payeeRole: "ADMIN", payeeUserId: input.reviewerUserId, rail: "LIGHTNING", status: "PENDING" },
    ],
    skipDuplicates: true,
  })
}
