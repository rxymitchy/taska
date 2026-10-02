import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ReviewControls } from "@/components/review-controls"
import { Container, StatusPill } from "@/components/ui"
import { formatWhen } from "@/lib/format"
import { formatSats } from "@/lib/money"
import { prisma } from "@/lib/prisma"
import { choiceLabels } from "@/lib/styles"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Task progress" }

export default async function EmployerTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireRole(["EMPLOYER", "ADMIN"])
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      employer: true,
      submissions: {
        orderBy: { submittedAt: "desc" },
        include: { worker: true },
      },
    },
  })
  if (!task) notFound()
  if (user.role !== "ADMIN" && task.employer.userId !== user.id) notFound()

  const budget = task.rewardSats * task.quantity
  const spent = task.rewardSats * task.completedQuantity

  return (
    <Container className="page-frame">
      <p className="text-sm text-muted">{task.category}</p>
      <h1 className="mt-2 text-3xl tracking-tight">{task.title}</h1>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-card p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Total task budget</dt>
          <dd className="mt-2"><span className="inline-flex rounded-md bg-hl px-2 py-1 font-semibold tabular-nums text-ink">{formatSats(budget)}</span></dd>
        </div>
        <div className="rounded-lg border border-line bg-card p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Spent</dt>
          <dd className="mt-2"><span className="inline-flex rounded-md bg-hl px-2 py-1 font-semibold tabular-nums text-ink">{formatSats(spent)}</span></dd>
        </div>
        <div className="rounded-lg border border-line bg-card p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Status</dt>
          <dd className="mt-1 flex items-center gap-2 text-xl">
            <StatusPill status={task.status} />
            <span className="text-base">
              {task.completedQuantity} / {task.quantity}
            </span>
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-muted">
        Funded means the budget is recorded. Taska does not custody the sats. Approval sends a Lightning payment to the worker.
      </p>
      <h2 className="mt-10 text-xl">Submissions</h2>
      <ul className="mt-4 space-y-3">
        {task.submissions.length === 0 ? (
          <li className="text-sm text-muted">No submissions yet.</li>
        ) : (
          task.submissions.map((submission) => {
            const answers = submission.answers as { choice?: keyof typeof choiceLabels; reason?: string; notes?: string }
            return (
              <li key={submission.id} className="content-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{submission.worker.name}</p>
                  <StatusPill status={submission.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {submission.worker.country} · {formatWhen(submission.submittedAt)}
                  {submission.qualityScore != null ? ` · Quality ${submission.qualityScore}` : ""}
                </p>
                <p className="mt-3 text-sm">
                  {answers.choice ? choiceLabels[answers.choice] : answers.notes}
                </p>
                {answers.reason ? <p className="mt-1 text-sm text-muted">{answers.reason}</p> : null}
                {submission.status === "PENDING" ? (
                  <div className="mt-4">
                    <ReviewControls submissionId={submission.id} />
                  </div>
                ) : null}
              </li>
            )
          })
        )}
      </ul>
    </Container>
  )
}
