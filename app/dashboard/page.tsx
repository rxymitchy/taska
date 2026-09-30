import type { Metadata } from "next"
import Link from "next/link"
import { LightningPending } from "@/components/lightning-pending"
import { Container, StatusPill } from "@/components/ui"
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

  return (
    <Container className="py-10">
      <h1 className="text-3xl tracking-tight">Answers in your language</h1>
      <p className="mt-2 text-muted">
        Does this slang, greeting, or local detail actually work? If a reviewer agrees, you get paid.
      </p>
      {payouts.length > 0 ? (
        <div className="mt-6 space-y-2">
          {payouts.map((payout) => (
            <LightningPending key={payout.id} who="Evaluator" status={payout.status} amountSats={payout.amountSats} />
          ))}
        </div>
      ) : null}
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-card">
        {evaluations.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">Nothing assigned yet. When a company sends an answer in your language, it lands here.</li>
        ) : (
          evaluations.map((evaluation) => (
            <li key={evaluation.id}>
              <Link className="flex flex-wrap items-center justify-between gap-3 px-4 py-4" href={`/dashboard/evaluations/${evaluation.id}`}>
                <span>
                  <span className="block font-medium">{evaluation.prompt}</span>
                  <span className="text-sm text-muted">
                    {evaluation.language} · {evaluation.context}
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
