import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container, StatusPill } from "@/components/ui"
import { yesNo } from "@/lib/evaluation-copy"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { buildCompanyReport } from "@/services/reports"

export const metadata: Metadata = { title: "Evaluation" }

export default async function CompanyEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireRole(["EMPLOYER", "ADMIN"])
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: { company: true, submissions: true, assignedWorker: { select: { name: true } } },
  })
  if (!evaluation) notFound()
  if (user.role !== "ADMIN" && evaluation.company.userId !== user.id) notFound()

  const report = buildCompanyReport(evaluation)

  return (
    <Container className="max-w-2xl py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {report.language} · {report.context}
          {evaluation.assignedWorker ? ` · ${evaluation.assignedWorker.name}` : " · waiting for a speaker"}
        </p>
        <StatusPill status={evaluation.status} />
      </div>
      <h1 className="mt-3 text-3xl tracking-tight">Evaluation</h1>
      <section className="mt-8 space-y-4">
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
        <section className="mt-8 rounded-lg border border-line bg-card p-4">
          <h2 className="text-xl tracking-tight">Validated evaluation</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt>Factually correct</dt>
              <dd>{yesNo(report.factuallyCorrect)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Language sounds natural</dt>
              <dd>{yesNo(report.languageNatural)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Understands local context</dt>
              <dd>{yesNo(report.understandsContext)}</dd>
            </div>
          </dl>
          {report.betterAnswer ? (
            <div className="mt-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted">Better answer</h3>
              <p className="mt-1 whitespace-pre-wrap">{report.betterAnswer}</p>
            </div>
          ) : null}
          {report.comment ? <p className="mt-4 text-sm text-muted">{report.comment}</p> : null}
        </section>
      ) : (
        <p className="mt-8 text-sm text-muted">
          {evaluation.status === "PENDING" && !evaluation.assignedWorkerId
            ? "Waiting for a speaker of this language. Credits stay held until then."
            : "A local speaker is checking this. The validated result appears here after a reviewer agrees — then sats move."}
        </p>
      )}
    </Container>
  )
}
