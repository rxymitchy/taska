import { prisma } from "@/lib/prisma"
import { payableLightningDestination, usesLiveLightning } from "@/lib/payout-destination"
import { evaluatorPayoutSats, reviewerPayoutSats } from "@/lib/pricing"
import { getLightningService } from "@/services/lightning"
import type { EvaluationPayout, Role } from "@prisma/client"

export type ValidatedPayout = {
  evaluationId: string
  workerUserId: string
  reviewerUserId: string
}

async function currentDestination(role: Role, userId: string) {
  if (role === "WORKER") {
    const worker = await prisma.workerProfile.findUnique({ where: { userId } })
    return payableLightningDestination(worker?.lightningAddress)
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { lightningAddress: true } })
  const fromUser =
    payableLightningDestination(user?.lightningAddress) ??
    payableLightningDestination(process.env.REVIEWER_LIGHTNING_ADDRESS)
  if (fromUser) return fromUser
  const worker = await prisma.workerProfile.findUnique({ where: { userId } })
  return payableLightningDestination(worker?.lightningAddress)
}

function mockFallback(role: Role) {
  return role === "WORKER" ? "evaluator@taska.demo" : "reviewer@taska.demo"
}

export async function payoutDestinationsReady(input: { workerUserId: string; reviewerUserId: string }) {
  if (!usesLiveLightning()) return { ok: true as const }
  const [worker, reviewer] = await Promise.all([
    currentDestination("WORKER", input.workerUserId),
    currentDestination("ADMIN", input.reviewerUserId),
  ])
  if (!worker) {
    return { ok: false as const, error: "They have no pay address yet. They must add one before anyone can be paid." }
  }
  if (!reviewer) {
    return { ok: false as const, error: "Add where you get paid before you pay out." }
  }
  return { ok: true as const }
}

async function settlePayout(payout: EvaluationPayout) {
  const destination =
    (await currentDestination(payout.payeeRole, payout.payeeUserId)) ??
    (usesLiveLightning() ? null : mockFallback(payout.payeeRole))
  if (!destination) {
    await prisma.evaluationPayout.update({
      where: { id: payout.id },
      data: { status: "FAILED", settledAt: new Date() },
    })
    return
  }

  const lightning = getLightningService()
  try {
    const paid = await lightning.payDestination(
      destination,
      payout.amountSats,
      `Taska ${payout.payeeRole.toLowerCase()} ${payout.evaluationId}`,
    )
    const sent = paid.status === "PAID"
    await prisma.evaluationPayout.update({
      where: { id: payout.id },
      data: {
        destination,
        invoice: paid.invoice,
        paymentHash: paid.paymentHash,
        status: sent ? "SENT" : "FAILED",
        settledAt: new Date(),
      },
    })
  } catch {
    await prisma.evaluationPayout.update({
      where: { id: payout.id },
      data: { destination, status: "FAILED", settledAt: new Date() },
    })
  }
}

/**
 * Pays the evaluator and reviewer over Lightning after approval.
 * Live rail is Breez. Mock invoices start with lnmock1 and do not move bitcoin.
 * A failed pay leaves the evaluation Completed; retryFailedPayouts can send again without paying twice.
 */
export async function recordPendingLightningPayouts(input: ValidatedPayout) {
  const destinations: { role: Role; userId: string; amountSats: number }[] = [
    { role: "WORKER", userId: input.workerUserId, amountSats: evaluatorPayoutSats() },
    { role: "ADMIN", userId: input.reviewerUserId, amountSats: reviewerPayoutSats() },
  ]

  const rows = await Promise.all(
    destinations.map(async (row) => ({
      evaluationId: input.evaluationId,
      payeeRole: row.role,
      payeeUserId: row.userId,
      rail: "LIGHTNING" as const,
      amountSats: row.amountSats,
      destination: (await currentDestination(row.role, row.userId)) ?? (usesLiveLightning() ? "" : mockFallback(row.role)),
      status: "PENDING" as const,
    })),
  )

  await prisma.evaluationPayout.createMany({
    data: rows.filter((row) => row.destination.length > 0),
    skipDuplicates: true,
  })

  const pending = await prisma.evaluationPayout.findMany({
    where: { evaluationId: input.evaluationId, status: "PENDING" },
  })
  for (const payout of pending) {
    await settlePayout(payout)
  }
}

/** Pays FAILED rows again, using the address on the profile now. Does not pay SENT rows. */
export async function retryFailedPayouts() {
  const failed = await prisma.evaluationPayout.findMany({
    where: { status: "FAILED" },
    orderBy: { createdAt: "asc" },
    take: 40,
  })
  let retried = 0
  for (const payout of failed) {
    const claimed = await prisma.evaluationPayout.updateMany({
      where: { id: payout.id, status: "FAILED" },
      data: { status: "PENDING" },
    })
    if (claimed.count !== 1) continue
    const current = await prisma.evaluationPayout.findUnique({ where: { id: payout.id } })
    if (current) await settlePayout(current)
    retried += 1
  }
  return retried
}
