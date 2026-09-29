import { prisma } from "@/lib/prisma"

/**
 * Teammate B owns this function.
 *
 * Input: a new evaluation id, plus whatever availability data you add later.
 * Processing: choose one evaluator.
 * Output: that worker's WorkerProfile id, or null to leave the evaluation pending.
 * Connects at createEvaluation(), which calls assignEvaluation() after the row exists.
 *
 * The placeholder prefers the demo evaluator so the core flow works before matching exists.
 * Replace the body. Do not change Evaluation.status values.
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
