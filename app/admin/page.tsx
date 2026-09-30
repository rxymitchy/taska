import type { Metadata } from "next"
import Link from "next/link"
import { LightningPending } from "@/components/lightning-pending"
import { retryFailedPayouts } from "@/app/actions/payouts"
import { Container, StatusPill } from "@/components/ui"
import { prisma } from "@/lib/prisma"
import { btnSecondary } from "@/lib/styles"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Review" }

export default async function AdminPage() {
  const user = await requireRole(["ADMIN"])
  const [queue, payouts, failedPayouts] = await Promise.all([
    prisma.evaluation.findMany({
      where: { status: "UNDER_REVIEW" },
      orderBy: { createdAt: "asc" },
      include: { company: true },
    }),
    prisma.evaluationPayout.findMany({
      where: { payeeUserId: user.id, payeeRole: "ADMIN" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.evaluationPayout.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl tracking-tight">Review queue</h1>
          <p className="mt-2 text-muted">
            If you agree with the check, the speaker gets paid in sats. If you don’t, the work comes back and nobody is
            charged.
          </p>
        </div>
        <Link className="text-sm font-semibold text-accent underline" href="/admin/invite">
          Invite a reviewer
        </Link>
      </div>
      {failedPayouts.length > 0 ? (
        <form action={retryFailedPayouts} className="mt-6 rounded-lg border border-line bg-card px-4 py-3">
          <p className="text-sm">
            {failedPayouts.length === 1 ? "One Lightning payout failed." : `${failedPayouts.length} Lightning payouts failed.`}{" "}
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
          <li className="px-4 py-4 text-sm text-muted">Nothing is waiting for review.</li>
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
