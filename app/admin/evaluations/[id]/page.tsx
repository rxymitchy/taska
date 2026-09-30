import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { decideEvaluation } from "@/app/actions/evaluations"
import { Container } from "@/components/ui"
import { yesNo } from "@/lib/evaluation-copy"
import { prisma } from "@/lib/prisma"
import { btnPrimary, btnSecondary } from "@/lib/styles"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Review evaluation" }

export default async function ReviewEvaluationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ pay?: string }>
}) {
  await requireRole(["ADMIN"])
  const { id } = await params
  const { pay } = await searchParams
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: { submissions: { orderBy: { submittedAt: "desc" }, take: 1 }, assignedWorker: true },
  })
  if (!evaluation) notFound()
  if (evaluation.status !== "UNDER_REVIEW") redirect("/admin")
  const answers = evaluation.submissions[0]
  if (!answers) redirect("/admin")

  return (
    <Container className="max-w-2xl py-10">
      <p className="text-sm text-muted">
        {evaluation.language} · {evaluation.context}
        {evaluation.assignedWorker ? ` · ${evaluation.assignedWorker.name}` : ""}
      </p>
      <h1 className="mt-2 text-3xl tracking-tight">Does this check hold?</h1>
      {pay === "need-address" ? (
        <p className="mt-4 rounded-md border border-line bg-card px-3 py-2 text-sm">
          Live Lightning needs a real address on the speaker’s profile and on yours. Demo placeholders are not paid.
          Nobody is charged until that is fixed.
        </p>
      ) : null}
      <section className="mt-6 space-y-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Question</h2>
          <p className="mt-1 whitespace-pre-wrap">{evaluation.prompt}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted">AI response</h2>
          <p className="mt-1 whitespace-pre-wrap">{evaluation.aiResponse}</p>
          <p className="mt-1 text-sm text-muted">Model: {evaluation.aiModel}</p>
        </div>
        <dl className="space-y-2 rounded-lg border border-line bg-card p-4 text-sm">
          <div className="flex justify-between gap-4"><dt>Factually correct</dt><dd>{yesNo(answers.factuallyCorrect)}</dd></div>
          <div className="flex justify-between gap-4"><dt>Language sounds natural</dt><dd>{yesNo(answers.languageNatural)}</dd></div>
          <div className="flex justify-between gap-4"><dt>Understands local context</dt><dd>{yesNo(answers.understandsContext)}</dd></div>
          {answers.comment ? <p className="pt-2 text-muted">{answers.comment}</p> : null}
        </dl>
        {answers.betterAnswer ? (
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted">Evaluator’s better answer</h2>
            <p className="mt-1 whitespace-pre-wrap">{answers.betterAnswer}</p>
          </div>
        ) : null}
      </section>
      <form action={decideEvaluation} className="mt-6 flex flex-wrap gap-3">
        <input type="hidden" name="evaluationId" value={evaluation.id} />
        <button className={btnPrimary} name="decision" value="approve">
          Agree — pay the speaker
        </button>
        <button className={btnSecondary} name="decision" value="reject">
          Send it back
        </button>
      </form>
    </Container>
  )
}
