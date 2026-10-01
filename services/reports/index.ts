import { prisma } from "@/lib/prisma"

export type CompanyReport = {
  prompt: string
  aiResponse: string
  aiModel: string
  language: string
  context: string
  factuallyCorrect: boolean | null
  languageNatural: boolean | null
  understandsContext: boolean | null
  betterAnswer: string
  comment: string
  validated: boolean
}

type ReportSource = {
  prompt: string
  aiResponse: string
  aiModel?: string
  language: string
  context: string
  status: string
  submissions: {
    factuallyCorrect: boolean
    languageNatural: boolean
    understandsContext: boolean
    betterAnswer: string
    comment: string
    submittedAt: Date
  }[]
}

/**
 * The backend developer owns the shape of this report. See docs/team.md.
 *
 * Input: one evaluation and its submissions.
 * Processing: turn the latest validated answers into what the company reads.
 * Output: CompanyReport.
 * Connects on the company evaluation page. Add fields here rather than querying past this function.
 */
export function buildCompanyReport(evaluation: ReportSource): CompanyReport {
  const latest = [...evaluation.submissions].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())[0]
  return {
    prompt: evaluation.prompt,
    aiResponse: evaluation.aiResponse,
    aiModel: evaluation.aiModel ?? "pasted",
    language: evaluation.language,
    context: evaluation.context,
    factuallyCorrect: latest?.factuallyCorrect ?? null,
    languageNatural: latest?.languageNatural ?? null,
    understandsContext: latest?.understandsContext ?? null,
    betterAnswer: latest?.betterAnswer ?? "",
    comment: latest?.comment ?? "",
    validated: evaluation.status === "COMPLETED",
  }
}

export async function findValidatedEvaluations(companyId: string) {
  return prisma.evaluation.findMany({
    where: { companyId, status: "COMPLETED" },
    include: { submissions: true },
    orderBy: { completedAt: "desc" },
  })
}
