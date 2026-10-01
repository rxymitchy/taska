export type CompanyReport = {
  prompt: string
  aiResponse: string
  aiModel: string
  aiPrecheckFactuallyCorrect: boolean | null
  aiPrecheckLanguageNatural: boolean | null
  aiPrecheckUnderstandsContext: boolean | null
  aiPrecheckModel: string | null
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
  aiPrecheckFactuallyCorrect?: boolean | null
  aiPrecheckLanguageNatural?: boolean | null
  aiPrecheckUnderstandsContext?: boolean | null
  aiPrecheckModel?: string | null
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
    aiPrecheckFactuallyCorrect: evaluation.aiPrecheckFactuallyCorrect ?? null,
    aiPrecheckLanguageNatural: evaluation.aiPrecheckLanguageNatural ?? null,
    aiPrecheckUnderstandsContext: evaluation.aiPrecheckUnderstandsContext ?? null,
    aiPrecheckModel: evaluation.aiPrecheckModel ?? null,
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
