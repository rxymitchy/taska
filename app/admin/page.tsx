import type { Metadata } from "next"
import Link from "next/link"
import { LightningPending } from "@/components/lightning-pending"
import { Container, StatusPill } from "@/components/ui"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Review" }

export default async function AdminPage() {
  const user = await requireRole(["ADMIN"])
  const [queue, payouts] = await Promise.all([
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
  ])

  return (
    <Container className="py-10">
      <h1 className="text-3xl tracking-tight">Review queue</h1>
      <p className="mt-2 text-muted">Open a completed evaluation, then approve or reject it.</p>
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
