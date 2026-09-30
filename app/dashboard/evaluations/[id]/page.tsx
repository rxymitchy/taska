import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HumanEvaluationForm } from "@/components/human-evaluation-form"
import { LightningPending } from "@/components/lightning-pending"
import { Container, StatusPill } from "@/components/ui"
import { checkLabels, yesNo } from "@/lib/evaluation-copy"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Evaluate" }

export default async function WorkerEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireRole(["WORKER"])
  const worker = await prisma.workerProfile.findUnique({ where: { userId: user.id } })
  if (!worker) notFound()

  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: { submissions: { where: { workerId: worker.id }, orderBy: { submittedAt: "desc" }, take: 1 } },
  })
  if (!evaluation || evaluation.assignedWorkerId !== worker.id) notFound()
  const latest = evaluation.submissions[0]
  const payout = await prisma.evaluationPayout.findFirst({
    where: { evaluationId: evaluation.id, payeeUserId: user.id },
  })

  return (
    <Container className="max-w-2xl py-10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {evaluation.language} · {evaluation.context}
        </p>
        <StatusPill status={evaluation.status} />
      </div>
      <h1 className="mt-3 text-3xl tracking-tight">Does this sound right?</h1>
      <section className="mt-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Question</h2>
          <p className="mt-1 whitespace-pre-wrap">{evaluation.prompt}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Response</h2>
          <p className="mt-1 whitespace-pre-wrap">{evaluation.aiResponse}</p>
          <p className="mt-1 text-sm text-muted">Model: {evaluation.aiModel}</p>
        </div>
      </section>
      {evaluation.status === "ASSIGNED" ? (
        <div className="mt-8">
          {!worker.lightningAddress ? (
            <p className="mb-4 text-sm text-warn">
              Add where you get paid on your profile before you send this.
            </p>
          ) : null}
          <HumanEvaluationForm evaluationId={evaluation.id} defaults={latest} />
        </div>
      ) : null}
      {evaluation.status === "UNDER_REVIEW" || evaluation.status === "WORKER_COMPLETED" ? (
        <p className="mt-8 text-sm text-muted">A reviewer is checking your work. If they agree, you get paid.</p>
      ) : null}
      {evaluation.status === "COMPLETED" && latest ? (
        <section className="mt-8 space-y-3">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt>{checkLabels.factuallyCorrect}</dt><dd>{yesNo(latest.factuallyCorrect)}</dd></div>
            <div className="flex justify-between gap-4"><dt>{checkLabels.languageNatural}</dt><dd>{yesNo(latest.languageNatural)}</dd></div>
            <div className="flex justify-between gap-4"><dt>{checkLabels.understandsContext}</dt><dd>{yesNo(latest.understandsContext)}</dd></div>
          </dl>
          {latest.betterAnswer ? <p className="whitespace-pre-wrap text-sm text-muted">{latest.betterAnswer}</p> : null}
          {payout ? <LightningPending who="Evaluator" status={payout.status} amountSats={payout.amountSats} /> : null}
        </section>
      ) : null}
    </Container>
  )
}
