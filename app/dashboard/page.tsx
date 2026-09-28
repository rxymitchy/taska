import type { Metadata } from "next"
import Link from "next/link"
import { Container, Stat, StatusPill } from "@/components/ui"
import { formatWhen } from "@/lib/format"
import { formatSats, formatUsd } from "@/lib/money"
import { prisma } from "@/lib/prisma"
import { choiceLabels } from "@/lib/styles"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const user = await requireRole(["WORKER"])
  const worker = await prisma.workerProfile.findUnique({
    where: { userId: user.id },
    include: {
      submissions: {
        orderBy: { submittedAt: "desc" },
        take: 6,
        include: { task: true },
      },
      payments: {
        where: { status: "SENT" },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { lightningPayment: true, submission: { include: { task: true } } },
      },
    },
  })
  if (!worker) return null

  const [earnedAgg, reviewed] = await Promise.all([
    prisma.payment.aggregate({
      where: { workerId: worker.id, status: "SENT" },
      _sum: { amountSats: true },
    }),
    prisma.taskSubmission.count({
    where: { workerId: worker.id, status: { in: ["APPROVED", "REJECTED"] } },
    }),
  ])
  const earned = earnedAgg._sum.amountSats ?? 0

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl tracking-tight">{worker.name}</h1>
          <p className="mt-1 text-muted">{worker.country}</p>
        </div>
        <Link className="text-sm font-semibold text-accent" href={`/workers/${worker.id}`}>
          View public profile
        </Link>
      </div>
      {!worker.lightningAddress ? (
        <p className="mt-4 rounded-md border border-line bg-card px-3 py-2 text-sm">
          Add a Lightning address on your <Link className="underline" href="/profile">profile</Link> so approved work can be paid.
        </p>
      ) : null}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total earned" value={formatSats(earned)} hint={`≈ ${formatUsd(earned)}`} />
        <Stat label="Available balance" value={formatSats(earned)} hint="Sent to your Lightning destination" />
        <Stat label="Tasks completed" value={String(worker.tasksCompleted)} />
        <Stat
          label="Approval rate"
          value={reviewed === 0 ? "—" : `${Math.round(worker.approvalRate)}%`}
          hint={reviewed === 0 ? "Completes after review" : `Quality ${Math.round(worker.qualityScore)}`}
        />
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-xl">Recent tasks</h2>
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-card">
            {worker.submissions.length === 0 ? (
              <li className="px-4 py-4 text-sm text-muted">No submissions yet.</li>
            ) : (
              worker.submissions.map((submission) => {
                const answers = submission.answers as { choice?: keyof typeof choiceLabels }
                return (
                  <li key={submission.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="font-medium">{submission.task.title}</p>
                      <p className="text-sm text-muted">
                        {formatWhen(submission.submittedAt)}
                        {answers.choice ? ` · ${choiceLabels[answers.choice]}` : ""}
                      </p>
                    </div>
                    <StatusPill status={submission.status} />
                  </li>
                )
              })
            )}
          </ul>
        </section>
        <section>
          <h2 className="text-xl">Recent payments</h2>
          <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-card">
            {worker.payments.length === 0 ? (
              <li className="px-4 py-4 text-sm text-muted">Payments appear here after approval.</li>
            ) : (
              worker.payments.map((payment) => (
                <li key={payment.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{payment.submission.task.title}</p>
                    <p className="font-medium">+{formatSats(payment.amountSats)}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    Paid via Lightning · {formatWhen(payment.createdAt)}
                  </p>
                  {payment.lightningPayment ? (
                    <p className="mt-1 font-mono text-xs text-muted">
                      {payment.lightningPayment.paymentHash.slice(0, 16)}…
                    </p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </Container>
  )
}
