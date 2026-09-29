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
      where: { payeeUserId: user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return (
    <Container className="py-10">
      <h1 className="text-3xl tracking-tight">Your evaluations</h1>
      <p className="mt-2 text-muted">Open an assigned AI response, answer the three questions, and send it for review.</p>
      {payouts.length > 0 ? (
        <div className="mt-6">
          <LightningPending who="Evaluator" />
        </div>
      ) : null}
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-card">
        {evaluations.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">Nothing is assigned yet.</li>
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
