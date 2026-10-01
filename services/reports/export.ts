import { findValidatedEvaluations } from "./index";

export type ExportRow = {
  evaluationId: string;
  language: string;
  context: string;
  question: string;
  aiAnswer: string;
  isAccurate: boolean | null;
  isNatural: boolean | null;
  isCulturallyAware: boolean | null;
  betterAnswer: string | null;
  completedAt: string | null;
};

export async function buildExportRows(companyId: string): Promise<ExportRow[]> {
  const evaluations = await findValidatedEvaluations(companyId);

  return evaluations.map((evaluation: Awaited<typeof evaluations>[number]) => {
    const latestSubmission = [...evaluation.submissions].sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime(),
    )[0] ?? null;

    return {
      evaluationId: evaluation.id,
      language: evaluation.language,
      context: evaluation.context,
      question: evaluation.prompt,
      aiAnswer: evaluation.aiResponse,
      isAccurate: latestSubmission?.factuallyCorrect ?? null,
      isNatural: latestSubmission?.languageNatural ?? null,
      isCulturallyAware: latestSubmission?.understandsContext ?? null,
      betterAnswer: latestSubmission?.betterAnswer || null,
      completedAt: evaluation.completedAt?.toISOString() ?? null,
    };
  });
}