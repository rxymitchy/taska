import { buildCompanyReport, findValidatedEvaluations } from "./index"

export type ExportRow = ReturnType<typeof buildCompanyReport> & {
  evaluationId: string
  completedAt: string | null
}

export async function buildExportRows(companyId: string): Promise<ExportRow[]> {
  const evaluations = await findValidatedEvaluations(companyId)

  return evaluations.map((evaluation) => {
    return {
      evaluationId: evaluation.id,
      ...buildCompanyReport(evaluation),
      completedAt: evaluation.completedAt?.toISOString() ?? null,
    }
  })
}