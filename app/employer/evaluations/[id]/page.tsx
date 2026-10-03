import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { AiHumanComparison } from "@/components/ai-human-comparison"
import { CompanyStatus } from "@/components/company-status"
import { Container } from "@/components/ui"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { assignEvaluation } from "@/services/assignment"
import { buildCompanyReport } from "@/services/reports"

export const metadata: Metadata = { title: "Evaluation" }

export default async function CompanyEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireRole(["EMPLOYER", "ADMIN"])
  try {
    await assignEvaluation(id)
  } catch {
    // Still show the evaluation if assignment is slow.
  }
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: { company: true, submissions: true, assignedWorker: { select: { name: true } } },
  })
  if (!evaluation) notFound()
  if (user.role !== "ADMIN" && evaluation.company.userId !== user.id) notFound()

  const report = buildCompanyReport(evaluation)

  return (
    <Container className="page-frame max-w-2xl!">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {report.language} · {report.context}
        </p>
        <CompanyStatus status={evaluation.status} />
      </div>
      <h1 className="mt-3 text-3xl tracking-tight">Evaluation</h1>
      <section className="content-surface mt-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Question</h2>
          <p className="mt-1 whitespace-pre-wrap">{report.prompt}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">AI response</h2>
          <p className="mt-1 whitespace-pre-wrap">{report.aiResponse}</p>
          <p className="mt-1 text-sm text-muted">Model: {report.aiModel}</p>
        </div>
      </section>
      {report.validated ? (
        <>
          <AiHumanComparison
            ai={{
              factuallyCorrect: report.aiPrecheckFactuallyCorrect,
              languageNatural: report.aiPrecheckLanguageNatural,
              understandsContext: report.aiPrecheckUnderstandsContext,
              model: report.aiPrecheckModel,
            }}
            human={{
              factuallyCorrect: report.factuallyCorrect,
              languageNatural: report.languageNatural,
              understandsContext: report.understandsContext,
            }}
          />
          {report.betterAnswer || report.comment ? (
            <section className="content-surface mt-4">
              {report.betterAnswer ? (
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted">Better answer</h3>
                  <p className="mt-1 whitespace-pre-wrap">{report.betterAnswer}</p>
                </div>
              ) : null}
              {report.comment ? <p className="mt-4 text-sm text-muted">{report.comment}</p> : null}
            </section>
          ) : null}
        </>
      ) : (
        <p className="mt-8 text-sm text-muted">
          {evaluation.status === "PENDING" && !evaluation.assignedWorkerId
            ? "Waiting for someone in this country or who speaks this language. Your credit stays held until then."
            : evaluation.status === "ASSIGNED"
              ? "Someone is working on this. The status changes when they submit."
              : "This is being checked. The result shows up here after a reviewer agrees."}
        </p>
      )}
    </Container>
  )
}
