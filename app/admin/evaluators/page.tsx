import type { Metadata } from "next"
import Link from "next/link"
import { Container } from "@/components/ui"
import { isDemoAccountEmail } from "@/lib/demo-accounts"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "Evaluators" }

export default async function AdminEvaluatorsPage() {
  await requireAdmin()
  const evaluators = (
    await prisma.workerProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { email: true, role: true, isReviewer: true } },
        _count: { select: { assignedEvaluations: true } },
      },
    })
  ).filter((row) => !isDemoAccountEmail(row.user.email) && row.user.role === "WORKER")

  return (
    <Container className="page-frame max-w-3xl!">
      <h1 className="text-3xl tracking-tight">Evaluators</h1>
      <p className="mt-2 text-muted">Look in if someone needs help with their assigned work.</p>
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-card">
        {evaluators.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">No evaluators yet.</li>
        ) : (
          evaluators.map((evaluator) => (
            <li key={evaluator.id}>
              <Link className="flex flex-wrap items-center justify-between gap-3 px-4 py-4" href={`/admin/evaluators/${evaluator.id}`}>
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
          ))
        )}
      </ul>
    </Container>
  )
}
