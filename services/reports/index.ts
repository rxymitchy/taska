export type CompanyReport = {
  prompt: string
  aiResponse: string
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
 * Teammate E owns the shape of this report.
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
