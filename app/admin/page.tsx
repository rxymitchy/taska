import type { Metadata } from "next"
import Link from "next/link"
import { LightningPending } from "@/components/lightning-pending"
import { ReviewerLightningForm } from "@/components/invite-form"
import { retryFailedPayouts } from "@/app/actions/payouts"
import { Container, StatusPill } from "@/components/ui"
import { formatSats } from "@/lib/money"
import { lightningProviderName } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { btnSecondary } from "@/lib/styles"
import { requireAdmin } from "@/lib/session"
import { assignReviewer } from "@/services/assignment"
import { getLightningService } from "@/services/lightning"

async function readTillSats() {
  if (lightningProviderName() !== "breez") return { kind: "off" as const }
  try {
    const { balanceSats } = await getLightningService().getBalance()
    return { kind: "ok" as const, balanceSats }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read the till."
    return { kind: "error" as const, message }
  }
}

export const metadata: Metadata = { title: "Review" }
export const maxDuration = 60

export default async function AdminPage() {
  const user = await requireAdmin()
  const unassigned = await prisma.evaluation.findMany({
    where: { status: "UNDER_REVIEW", reviewerUserId: null },
    select: { id: true },
    take: 20,
  })
  for (const row of unassigned) await assignReviewer(row.id)

  const [queue, payouts, failedPayouts, till, me] = await Promise.all([
    prisma.evaluation.findMany({
      where: { status: "UNDER_REVIEW" },
      orderBy: { createdAt: "asc" },
      include: { company: true },
    }),
    prisma.evaluationPayout.findMany({
      where: { payeeUserId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.evaluationPayout.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    readTillSats(),
    prisma.user.findUnique({ where: { id: user.id }, select: { lightningAddress: true } }),
  ])

  return (
    <Container className="page-frame">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl tracking-tight">Review queue</h1>
          <p className="mt-2 text-muted">
            If you agree, they get paid. If you don’t, it comes back and nobody is charged.
          </p>
        </div>
        <Link className="text-sm font-semibold text-accent underline" href="/admin/people">
          People and roles
        </Link>
      </div>
      <section className="form-surface mt-6 max-w-xl">
        <h2 className="text-lg">Where you get paid</h2>
        <p className="mt-1 text-sm text-muted">Approved reviews pay this wallet.</p>
        <div className="mt-4">
          <ReviewerLightningForm current={me?.lightningAddress ?? ""} />
        </div>
      </section>
      {till.kind === "ok" ? (
        <div className="mt-6 rounded-lg border border-line bg-card px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Bitcoin in the till</p>
          <p className="mt-2"><span className="inline-flex rounded-md bg-hl px-2 py-1 font-display text-2xl tabular-nums text-ink">{formatSats(till.balanceSats)}</span></p>
          <p className="mt-1 text-sm text-muted">What companies have paid in, minus what we have paid out.</p>
        </div>
      ) : till.kind === "error" ? (
        <div className="mt-6 rounded-lg border border-line bg-card px-4 py-3">
          <p className="text-sm text-muted">{till.message}</p>
        </div>
      ) : null}
      {failedPayouts.length > 0 ? (
        <form action={retryFailedPayouts} className="mt-6 rounded-lg border border-line bg-card px-4 py-3">
          <p className="text-sm">
            {failedPayouts.length === 1 ? "One payment failed." : `${failedPayouts.length} payments failed.`}{" "}
            Retry pays the address on the profile now. It does not pay a row that already says Sent.
          </p>
          <button className={`${btnSecondary} mt-3`} type="submit">
            Retry failed payouts
          </button>
        </form>
      ) : null}
      {payouts.length > 0 ? (
        <div className="mt-6 space-y-2">
          {payouts.map((payout) => (
            <LightningPending key={payout.id} who="Reviewer" status={payout.status} amountSats={payout.amountSats} />
          ))}
        </div>
      ) : null}
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-card">
        {queue.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">
            Nothing is waiting for review. An evaluator has to submit a check first.
          </li>
        ) : (
          queue.map((evaluation) => (
            <li key={evaluation.id}>
              <Link className="flex flex-wrap items-center justify-between gap-3 px-4 py-4" href={`/admin/evaluations/${evaluation.id}`}>
                <span>
                  <span className="block font-medium">{evaluation.prompt}</span>
                  <span className="text-sm text-muted">
                    {evaluation.company.companyName} · {evaluation.language} · {evaluation.context}
                  </span>
                </span>
                <StatusPill status={evaluation.status} />
              </Link>
            </li>
          ))
        )}
      </ul>
    </Container>
  )
}
