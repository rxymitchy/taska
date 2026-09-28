import type { Metadata } from "next"
import Link from "next/link"
import { ReviewControls } from "@/components/review-controls"
import { Container, StatusPill } from "@/components/ui"
import { formatWhen } from "@/lib/format"
import { formatSats } from "@/lib/money"
import { prisma } from "@/lib/prisma"
import { choiceLabels } from "@/lib/styles"
import { getLightningService } from "@/services/lightning"

export const metadata: Metadata = { title: "Review" }

export default async function AdminPage() {
  const [submissions, tasks, workers, employers, payments, balance] = await Promise.all([
    prisma.taskSubmission.findMany({
      orderBy: { submittedAt: "desc" },
      take: 20,
      include: { worker: true, task: true },
    }),
    prisma.task.findMany({ orderBy: { createdAt: "desc" }, take: 12, include: { employer: true } }),
    prisma.workerProfile.findMany({ orderBy: { tasksCompleted: "desc" }, take: 12 }),
    prisma.employerProfile.findMany({ include: { _count: { select: { tasks: true } } } }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { worker: true, lightningPayment: true },
    }),
    getLightningService().getBalance(),
  ])

  return (
    <Container className="py-10">
      <h1 className="text-3xl tracking-tight">Review</h1>
      <p className="mt-2 text-sm text-muted">
        Settlement rail balance (sandbox): {formatSats(balance.balanceSats)}. Approving a submission pays the worker. Rejecting does not.
      </p>

      <section className="mt-10">
        <h2 className="text-xl">Submissions</h2>
        <ul className="mt-4 space-y-3">
          {submissions.map((submission) => {
            const answers = submission.answers as { choice?: keyof typeof choiceLabels; reason?: string; notes?: string }
            return (
              <li key={submission.id} className="rounded-lg border border-line bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {submission.worker.name} · {submission.task.title}
                  </p>
                  <StatusPill status={submission.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatWhen(submission.submittedAt)}
                  {submission.qualityScore != null ? ` · Quality ${submission.qualityScore}` : ""}
                </p>
                <p className="mt-2 text-sm">{answers.choice ? choiceLabels[answers.choice] : answers.notes}</p>
                {answers.reason ? <p className="text-sm text-muted">{answers.reason}</p> : null}
                {submission.status === "PENDING" ? (
                  <div className="mt-3">
                    <ReviewControls submissionId={submission.id} />
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl">Tasks</h2>
        <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-card">
          {tasks.map((task) => (
            <li key={task.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span>
                {task.title}
                <span className="text-muted"> · {task.employer.companyName}</span>
              </span>
              <span className="text-muted">
                {task.completedQuantity}/{task.quantity} · {formatSats(task.rewardSats * task.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl">Workers</h2>
        <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-card">
          {workers.map((worker) => (
            <li key={worker.id} className="px-4 py-3 text-sm">
              <Link className="font-medium" href={`/workers/${worker.id}`}>
                {worker.name}
              </Link>
              <span className="text-muted">
                {" "}
                · {worker.country} · {worker.tasksCompleted} tasks · {Math.round(worker.approvalRate)}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl">Employers</h2>
        <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-card">
          {employers.map((employer) => (
            <li key={employer.id} className="px-4 py-3 text-sm">
              {employer.companyName}
              <span className="text-muted"> · {employer._count.tasks} tasks</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl">Payments</h2>
        <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-card">
          {payments.map((payment) => (
            <li key={payment.id} className="px-4 py-3 text-sm">
              <span className="font-medium">{payment.worker.name}</span>
              <span className="text-muted">
                {" "}
                · +{formatSats(payment.amountSats)} · {payment.paymentMethod} · {formatWhen(payment.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  )
}
