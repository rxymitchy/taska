import { prisma } from "@/lib/prisma"
import { companyCostPerEvaluation } from "@/lib/pricing"

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
  const deposit = await prisma.creditDeposit.findUnique({ where: { paymentHash } })
  if (!deposit || deposit.status === "PAID") return deposit
  if (deposit.status === "FAILED") return deposit

  await prisma.$transaction([
    prisma.creditDeposit.update({
      where: { id: deposit.id },
      data: { status: "PAID", paidAt: new Date() },
    }),
    prisma.employerProfile.update({
      where: { id: deposit.companyId },
      data: { prepaidSats: { increment: deposit.amountSats } },
    }),
    prisma.creditLedger.create({
      data: {
        companyId: deposit.companyId,
        kind: "DEPOSIT",
        amountSats: deposit.amountSats,
        depositId: deposit.id,
        note: "Lightning deposit",
      },
    }),
  ])
  return prisma.creditDeposit.findUnique({ where: { id: deposit.id } })
}
