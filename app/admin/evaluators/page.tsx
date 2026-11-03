import type { Metadata } from "next"
import Link from "next/link"
import { Container, EmptyState, PageHeader, Panel } from "@/components/ui"
import { notDemoEmailWhere } from "@/lib/demo-accounts"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "Evaluators" }

export default async function AdminEvaluatorsPage() {
  await requireAdmin()
  const evaluators = await prisma.workerProfile.findMany({
    where: { user: { role: "WORKER", ...notDemoEmailWhere() } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { email: true, role: true, isReviewer: true } },
      _count: { select: { assignedEvaluations: true } },
    },
  })

  return (
    <Container className="page-frame max-w-3xl!">
      <PageHeader title="Evaluators" description="Look in if someone needs help with their assigned work." />
      <Panel className="mt-10">
        {evaluators.length === 0 ? (
          <EmptyState title="No evaluators yet" body="When someone signs up to check answers, they will show up here." />
        ) : (
          <ul className="divide-y divide-[#12382b]/8">
            {evaluators.map((evaluator) => (
              <li key={evaluator.id}>
                <Link
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#12382b]/4"
                  href={`/admin/evaluators/${evaluator.id}`}
                >
                  <span>
                    <span className="block font-medium">{evaluator.name}</span>
                    <span className="text-sm text-muted">
                      {evaluator.user.email} · {evaluator.country}
                      {evaluator.languages.length ? ` · ${evaluator.languages.join(", ")}` : ""}
                    </span>
                  </span>
                  <span className="text-sm text-muted">{evaluator._count.assignedEvaluations} assigned</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </Container>
  )
}
