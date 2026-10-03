import { countries } from "@/lib/catalog"
import { usesLiveLightning } from "@/lib/payout-destination"
import { prisma } from "@/lib/prisma"

const OPEN_STATUSES = ["ASSIGNED", "WORKER_COMPLETED", "UNDER_REVIEW"] as const

export function isDemoEvaluatorEmail(email: string) {
  return /@(taska\.demo|demo\.taska)$/i.test(email.trim())
}

function allowDemoEvaluators() {
  return !usesLiveLightning() && !process.env.VERCEL
}

export function countryFromContext(context: string) {
  return countries.find((country) => context.includes(country))
}

export function scoreSpeaker(input: {
  country: string
  languages: string[]
  language: string
  context: string
  openAssignments: number
}) {
  const place = countryFromContext(input.context)
  const speaks = input.languages.includes(input.language)
  const inCountry = Boolean(place && input.country === place)
  let score = 0
  if (speaks && inCountry) score += 3000
  else if (speaks) score += 2000
  else if (inCountry) score += 1000
  score -= input.openAssignments * 10
  return score
}

/**
 * Picks a real signed-up evaluator in that country, or who speaks that language,
 * or both. Live Taska never assigns demo seed accounts.
 */
export async function pickEvaluator(evaluation: { language: string; context: string }) {
  const place = countryFromContext(evaluation.context)
  const speakers = await prisma.workerProfile.findMany({
    where: {
      user: { role: "WORKER" },
      ...(place
        ? { OR: [{ languages: { has: evaluation.language } }, { country: place }] }
        : { languages: { has: evaluation.language } }),
    },
    select: {
      id: true,
      country: true,
      languages: true,
      user: { select: { email: true } },
      assignedEvaluations: {
        where: { status: { in: [...OPEN_STATUSES] } },
        select: { id: true },
      },
    },
  })

  const real = speakers.filter((speaker) => !isDemoEvaluatorEmail(speaker.user.email))
  const pool = allowDemoEvaluators() && real.length === 0 ? speakers : real
  if (pool.length === 0) return null

  const ranked = pool
    .map((speaker) => ({
      id: speaker.id,
      score: scoreSpeaker({
        country: speaker.country,
        languages: speaker.languages,
        language: evaluation.language,
        context: evaluation.context,
        openAssignments: speaker.assignedEvaluations.length,
      }),
    }))
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.id ?? null
}

export async function assignEvaluation(evaluationId: string) {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: evaluationId },
    include: {
      submissions: { select: { id: true }, take: 1 },
      assignedWorker: { select: { user: { select: { email: true } } } },
    },
  })
  if (!evaluation) return evaluation
  if (evaluation.status !== "PENDING" && evaluation.status !== "ASSIGNED") return evaluation

  const assignedToDemo = Boolean(
    evaluation.assignedWorker && isDemoEvaluatorEmail(evaluation.assignedWorker.user.email),
  )
  if (evaluation.assignedWorkerId && !assignedToDemo) return evaluation
  if (assignedToDemo && evaluation.submissions.length > 0) return evaluation

  const workerId = await pickEvaluator(evaluation)
  if (!workerId) {
    if (assignedToDemo && evaluation.submissions.length === 0) {
      await prisma.evaluation.updateMany({
        where: { id: evaluation.id, status: "ASSIGNED", assignedWorkerId: evaluation.assignedWorkerId },
        data: { status: "PENDING", assignedWorkerId: null, assignedAt: null },
      })
    }
    return prisma.evaluation.findUnique({ where: { id: evaluation.id } })
  }
  if (workerId === evaluation.assignedWorkerId) return evaluation

  await prisma.evaluation.updateMany({
    where: evaluation.assignedWorkerId
      ? { id: evaluation.id, status: "ASSIGNED", assignedWorkerId: evaluation.assignedWorkerId }
      : { id: evaluation.id, status: "PENDING", assignedWorkerId: null },
    data: { status: "ASSIGNED", assignedWorkerId: workerId, assignedAt: new Date() },
  })
  return prisma.evaluation.findUnique({ where: { id: evaluation.id } })
}

export async function assignOpenCompanyEvaluations(companyId: string) {
  const open = await prisma.evaluation.findMany({
    where: { companyId, status: { in: ["PENDING", "ASSIGNED"] } },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      status: true,
      assignedWorker: { select: { user: { select: { email: true } } } },
    },
  })
  for (const row of open) {
    const demo = Boolean(row.assignedWorker && isDemoEvaluatorEmail(row.assignedWorker.user.email))
    if (row.status === "PENDING" || demo) {
      await assignEvaluation(row.id)
    }
  }
}
