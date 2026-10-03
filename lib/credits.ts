import { prisma } from "@/lib/prisma"
import { companyCostPerEvaluation, lightningProviderName } from "@/lib/pricing"
import { getLightningService } from "@/services/lightning"

export async function holdCompanyCredits(
  companyId: string,
  count: number,
  note: string,
): Promise<{ error: string } | { amountSats: number }> {
  const amountSats = companyCostPerEvaluation() * count
  if (amountSats <= 0 || count <= 0) return { error: "Nothing to hold." }

  const moved = await prisma.employerProfile.updateMany({
    where: { id: companyId, prepaidSats: { gte: amountSats } },
    data: { prepaidSats: { decrement: amountSats }, heldSats: { increment: amountSats } },
  })
  if (moved.count !== 1) {
    const company = await prisma.employerProfile.findUnique({ where: { id: companyId } })
    const have = company?.prepaidSats ?? 0
    return {
      error: `Not enough credits. This needs ${amountSats.toLocaleString("en-US")} sats and you have ${have.toLocaleString("en-US")} available. Add credits first.`,
    }
  }

  await prisma.creditLedger.create({
    data: { companyId, kind: "HOLD", amountSats, note },
  })
  return { amountSats }
}

export async function releaseEvaluationHold(evaluationId: string) {
  const evaluation = await prisma.evaluation.findUnique({ where: { id: evaluationId } })
  if (!evaluation || evaluation.heldSats <= 0) return

  const amountSats = evaluation.heldSats
  const moved = await prisma.employerProfile.updateMany({
    where: { id: evaluation.companyId, heldSats: { gte: amountSats } },
    data: { heldSats: { decrement: amountSats }, prepaidSats: { increment: amountSats } },
  })
  if (moved.count !== 1) return

  await prisma.evaluation.update({ where: { id: evaluationId }, data: { heldSats: 0 } })
  await prisma.creditLedger.create({
    data: {
      companyId: evaluation.companyId,
      kind: "RELEASE",
      amountSats,
      evaluationId,
      note: "Rejected work. Credits returned.",
    },
  })
}

export async function spendEvaluationHold(evaluationId: string) {
  const evaluation = await prisma.evaluation.findUnique({ where: { id: evaluationId } })
  if (!evaluation || evaluation.heldSats <= 0) return

  const amountSats = evaluation.heldSats
  const moved = await prisma.employerProfile.updateMany({
    where: { id: evaluation.companyId, heldSats: { gte: amountSats } },
    data: { heldSats: { decrement: amountSats } },
  })
  if (moved.count !== 1) return

  await prisma.evaluation.update({ where: { id: evaluationId }, data: { heldSats: 0 } })
  await prisma.creditLedger.create({
    data: {
      companyId: evaluation.companyId,
      kind: "SPEND",
      amountSats,
      evaluationId,
      note: "Approved evaluation.",
    },
  })
}

export async function applyPaidDeposit(paymentHash: string) {
  return prisma.$transaction(async (tx) => {
    const deposit = await tx.creditDeposit.findUnique({ where: { paymentHash } })
    if (!deposit || deposit.status === "FAILED") return deposit

    if (deposit.status === "PENDING") {
      const claimed = await tx.creditDeposit.updateMany({
        where: { id: deposit.id, status: "PENDING" },
        data: { status: "PAID", paidAt: new Date() },
      })
      if (claimed.count !== 1) {
        return tx.creditDeposit.findUnique({ where: { id: deposit.id } })
      }
    }

    const already = await tx.creditLedger.findFirst({
      where: { depositId: deposit.id, kind: "DEPOSIT" },
    })
    if (already) {
      return tx.creditDeposit.findUnique({ where: { id: deposit.id } })
    }

    try {
      await tx.creditLedger.create({
        data: {
          companyId: deposit.companyId,
          kind: "DEPOSIT",
          amountSats: deposit.amountSats,
          depositId: deposit.id,
          note: "Lightning deposit",
        },
      })
    } catch {
      return tx.creditDeposit.findUnique({ where: { id: deposit.id } })
    }

    await tx.employerProfile.update({
      where: { id: deposit.companyId },
      data: { prepaidSats: { increment: deposit.amountSats } },
    })
    return tx.creditDeposit.findUnique({ where: { id: deposit.id } })
  })
}

/** Take back extra DEPOSIT rows if the same invoice was credited more than once. */
export async function repairDuplicateDepositCredits(companyId: string) {
  const rows = await prisma.creditLedger.findMany({
    where: { companyId, kind: "DEPOSIT", depositId: { not: null } },
    orderBy: { createdAt: "asc" },
  })

  const extras = new Map<string, typeof rows>()
  for (const row of rows) {
    if (!row.depositId) continue
    const group = extras.get(row.depositId) ?? []
    group.push(row)
    extras.set(row.depositId, group)
  }

  let reversed = 0
  for (const group of extras.values()) {
    for (const extra of group.slice(1)) {
      const took = await prisma.$transaction(async (tx) => {
        const gone = await tx.creditLedger.deleteMany({
          where: { id: extra.id, kind: "DEPOSIT" },
        })
        if (gone.count !== 1) return 0
        const company = await tx.employerProfile.findUnique({ where: { id: extra.companyId } })
        const take = Math.min(company?.prepaidSats ?? 0, extra.amountSats)
        if (take > 0) {
          await tx.employerProfile.update({
            where: { id: extra.companyId },
            data: { prepaidSats: { decrement: take } },
          })
        }
        return 1
      })
      reversed += took
    }
  }
  return reversed
}

/** Look up pending invoices on the till and credit any that have already been paid. */
export async function settlePaidDeposits(companyId: string) {
  await repairDuplicateDepositCredits(companyId)
  if (lightningProviderName() !== "breez") return 0

  const pending = await prisma.creditDeposit.findMany({
    where: { companyId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 12,
  })
  if (pending.length === 0) return 0

  const lightning = getLightningService()
  const usedPayments = new Set<string>()
  let credited = 0
  for (const deposit of pending) {
    const status = await lightning.getPaymentStatus(
      deposit.paymentHash,
      deposit.invoice,
      deposit.amountSats,
    )
    if (status.status !== "PAID") continue
    if (status.amountSats && status.amountSats !== deposit.amountSats) continue
    const paymentKey = status.paymentHash || deposit.paymentHash
    if (usedPayments.has(paymentKey)) continue
    usedPayments.add(paymentKey)
    await applyPaidDeposit(deposit.paymentHash)
    credited += 1
  }
  return credited
}
