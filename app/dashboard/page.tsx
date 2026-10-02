import type { Metadata } from "next"
import Link from "next/link"
import { LightningPending } from "@/components/lightning-pending"
import { Container, StatusPill } from "@/components/ui"
import { btnSecondary } from "@/lib/styles"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Evaluations" }

export default async function DashboardPage() {
  const user = await requireRole(["WORKER"])
  const worker = await prisma.workerProfile.findUnique({ where: { userId: user.id } })
  if (!worker) return null

  const [evaluations, payouts] = await Promise.all([
    prisma.evaluation.findMany({
      where: { assignedWorkerId: worker.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.evaluationPayout.findMany({
      where: { payeeUserId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])
  const assignedCount = evaluations.filter((evaluation) => evaluation.status === "ASSIGNED").length
  const reviewCount = evaluations.filter(
    (evaluation) => evaluation.status === "UNDER_REVIEW" || evaluation.status === "WORKER_COMPLETED",
  ).length

  return (
    <Container className="page-frame">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-xs font-semibold uppercase text-accent">Worker workspace</p>
          <h1 className="mt-1 text-3xl tracking-tight sm:text-4xl">Your work, in one place</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            Review answers, follow their status, and keep track of payouts.
          </p>
        </div>
        <Link className={btnSecondary} href="/tasks">Browse tasks</Link>
      </div>
      <dl className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        <div className="bg-card px-4 py-4">
          <dt className="text-xs font-medium uppercase text-muted">Assigned to you</dt>
          <dd className="mt-1 font-display text-3xl text-ink">{evaluations.length}</dd>
        </div>
        <div className="bg-card px-4 py-4">
          <dt className="text-xs font-medium uppercase text-muted">Ready for your review</dt>
          <dd className="mt-1 font-display text-3xl text-ink">{assignedCount}</dd>
        </div>
        <div className="bg-card px-4 py-4">
          <dt className="text-xs font-medium uppercase text-muted">With a reviewer</dt>
          <dd className="mt-1 font-display text-3xl text-ink">{reviewCount}</dd>
        </div>
      </dl>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section aria-labelledby="assigned-heading">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-accent">Your queue</p>
              <h2 id="assigned-heading" className="mt-1 text-xl tracking-tight">Assigned answers</h2>
            </div>
            <span className="text-sm text-muted">{evaluations.length} total</span>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line bg-card">
            {evaluations.length === 0 ? (
              <li className="px-4 py-6">
                <p className="font-medium">No assigned answers yet</p>
                <p className="mt-1 text-sm text-muted">Browse available tasks to find work you can start now.</p>
                <Link className="mt-4 inline-flex text-sm font-semibold text-accent underline underline-offset-4" href="/tasks">
                  Browse available tasks
                </Link>
              </li>
            ) : (
              evaluations.map((evaluation) => (
                <li key={evaluation.id}>
                  <Link className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 transition hover:bg-paper/70" href={`/dashboard/evaluations/${evaluation.id}`}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{evaluation.prompt}</span>
                      <span className="text-sm text-muted">{evaluation.language} · {evaluation.context}</span>
                    </span>
                    <StatusPill status={evaluation.status} />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
        <aside className="space-y-8">
          <section id="payouts" className="scroll-mt-24" aria-labelledby="payouts-heading">
            <div>
              <p className="text-xs font-semibold uppercase text-accent">Payment activity</p>
              <h2 id="payouts-heading" className="mt-1 text-xl tracking-tight">Recent payouts</h2>
            </div>
            {payouts.length > 0 ? (
              <ul className="mt-4 divide-y divide-line border-y border-line bg-card">
                {payouts.map((payout) => (
                  <li key={payout.id} className="px-3 py-3">
                    <LightningPending who="Evaluator" status={payout.status} amountSats={payout.amountSats} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 border-y border-line py-4 text-sm text-muted">
                Payout activity will appear here after an evaluation is approved.
              </p>
            )}
          </section>
          <section className="border-t border-line pt-5">
            <p className="text-xs font-semibold uppercase text-muted">Need more work?</p>
            <h2 className="mt-1 text-lg font-medium">Explore open tasks</h2>
            <p className="mt-1 text-sm text-muted">See available tasks, estimated time, and rewards before starting.</p>
            <Link className="mt-4 inline-flex text-sm font-semibold text-accent underline underline-offset-4" href="/tasks">
              View task marketplace
            </Link>
          </section>
        </aside>
      </div>
    </Container>
  )
}
