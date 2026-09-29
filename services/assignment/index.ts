import { prisma } from "@/lib/prisma"

/**
 * Picks the demo evaluator, otherwise the oldest evaluator account.
 * Returns null to leave the evaluation pending.
 */
export async function pickEvaluator(_evaluation: { id: string; language: string; context: string }) {
  const demo = await prisma.workerProfile.findFirst({
    where: { user: { email: "worker@taska.demo" } },
    select: { id: true },
  })
  if (demo) return demo.id
  const anyWorker = await prisma.workerProfile.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  })
  return anyWorker?.id ?? null
}

export async function assignEvaluation(evaluationId: string) {
  const evaluation = await prisma.evaluation.findUnique({ where: { id: evaluationId } })
  if (!evaluation || evaluation.status !== "PENDING" || evaluation.assignedWorkerId) return evaluation

  const workerId = await pickEvaluator(evaluation)
  if (!workerId) return evaluation

  const claimed = await prisma.evaluation.updateMany({
    where: { id: evaluationId, status: "PENDING", assignedWorkerId: null },
    data: { status: "ASSIGNED", assignedWorkerId: workerId, assignedAt: new Date() },
  })
  if (claimed.count !== 1) return prisma.evaluation.findUnique({ where: { id: evaluationId } })
  return prisma.evaluation.findUnique({ where: { id: evaluationId } })
}
