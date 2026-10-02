import { countries } from "@/lib/catalog"
import { prisma } from "@/lib/prisma"

const DEMO_SPEAKERS: Record<string, string[]> = {
  Swahili: ["rita@taska.demo", "worker@taska.demo", "rebecca@taska.demo"],
  Yoruba: ["chinedu@taska.demo"],
  Hausa: ["chinedu@taska.demo"],
  Twi: ["ama@taska.demo"],
  Kinyarwanda: ["jeanpierre@taska.demo"],
  French: ["jeanpierre@taska.demo", "fatou@taska.demo"],
  Wolof: ["fatou@taska.demo"],
  Amharic: ["yonas@taska.demo"],
  Zulu: ["thandiwe@taska.demo"],
  Afrikaans: ["thandiwe@taska.demo"],
}

export function countryFromContext(context: string) {
  return countries.find((country) => context.includes(country))
}

export function scoreSpeaker(input: {
  email: string
  country: string
  language: string
  context: string
  openAssignments: number
}) {
  const place = countryFromContext(input.context)
  const preferred = DEMO_SPEAKERS[input.language] ?? []
  const rank = preferred.indexOf(input.email.toLowerCase())
  let score = 0
  if (place && input.country === place) score += 1000
  if (rank >= 0) score += 200 - rank * 20
  score -= input.openAssignments * 10
  return score
}

/**
 * Picks a speaker who lists this language. Prefers the country in the context
 * (Kenya for M-Pesa, Nigeria for transfer, Ghana for MoMo). Leaves the row
 * pending if nobody speaks that language.
 */
export async function pickEvaluator(evaluation: { language: string; context: string }) {
  const speakers = await prisma.workerProfile.findMany({
    where: { languages: { has: evaluation.language } },
    select: {
      id: true,
      country: true,
      user: { select: { email: true } },
      assignedEvaluations: {
        where: { status: { in: ["ASSIGNED", "WORKER_COMPLETED", "UNDER_REVIEW"] } },
        select: { id: true },
      },
    },
  })
  if (speakers.length === 0) return null

  const ranked = speakers
    .map((speaker) => ({
      id: speaker.id,
      score: scoreSpeaker({
        email: speaker.user.email,
        country: speaker.country,
        language: evaluation.language,
        context: evaluation.context,
        openAssignments: speaker.assignedEvaluations.length,
      }),
    }))
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.id ?? null
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
