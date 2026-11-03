import type { Metadata } from "next"
import Link from "next/link"
import { LightningPending } from "@/components/lightning-pending"
import { Container, EmptyState, PageHeader, Panel, StatusPill, StatCard } from "@/components/ui"
import { btnPrimary } from "@/lib/styles"
import { notDemoCompanyWhere } from "@/lib/demo-accounts"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Evaluations" }

export default async function DashboardPage() {
  const user = await requireRole(["WORKER"])
  const worker = await prisma.workerProfile.findUnique({ where: { userId: user.id } })
  if (!worker) return null

  const [evaluations, payouts] = await Promise.all([
    prisma.evaluation.findMany({
      where: { assignedWorkerId: worker.id, company: notDemoCompanyWhere() },
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
      <PageHeader
        title="Your work"
        description="Checks assigned to you, and what you’ve been paid."
        actions={
          <Link className={btnPrimary} href="/tasks">
            Browse tasks
          </Link>
        }
      />

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned to you">
          <p className="font-display text-3xl tracking-tight">{evaluations.length}</p>
        </StatCard>
        <StatCard label="Ready for you">
          <p className="font-display text-3xl tracking-tight">{assignedCount}</p>
        </StatCard>
        <StatCard label="With a reviewer">
          <p className="font-display text-3xl tracking-tight">{reviewCount}</p>
        </StatCard>
      </dl>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-labelledby="assigned-heading">
          <h2 id="assigned-heading" className="mb-4 text-xl tracking-tight">
            Assigned answers
          </h2>
          <Panel>
            {evaluations.length === 0 ? (
              <EmptyState
                title="Nothing assigned yet"
                body="Open tasks to find work in a language you speak."
                action={
                  <Link className={btnPrimary} href="/tasks">
                    Browse tasks
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-[#12382b]/8">
                {evaluations.map((evaluation) => (
                  <li key={evaluation.id}>
                    <Link
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#12382b]/4"
                      href={`/dashboard/evaluations/${evaluation.id}`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{evaluation.prompt}</span>
                        <span className="text-sm text-muted">
                          {evaluation.language} · {evaluation.context}
                        </span>
                      </span>
                      <StatusPill status={evaluation.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>
        <aside id="payouts" className="scroll-mt-24">
          <h2 className="mb-4 text-xl tracking-tight">Recent payouts</h2>
          <Panel className="px-5 py-5">
            {payouts.length > 0 ? (
              <ul className="space-y-3">
                {payouts.map((payout) => (
                  <li key={payout.id}>
                    <LightningPending who="Evaluator" status={payout.status} amountSats={payout.amountSats} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-muted">
                Payouts show up here after a reviewer agrees.
              </p>
            )}
          </Panel>
        </aside>
      </div>
    </Container>
  )
}
