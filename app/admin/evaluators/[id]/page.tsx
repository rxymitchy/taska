import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CompanyStatus } from "@/components/company-status"
import { Container } from "@/components/ui"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "Evaluator" }

export default async function AdminEvaluatorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const evaluator = await prisma.workerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      assignedEvaluations: { orderBy: { createdAt: "desc" }, take: 40 },
    },
  })
  if (!evaluator) notFound()

  return (
    <Container className="page-frame max-w-3xl!">
      <p className="text-sm text-muted">
        <Link className="text-accent underline" href="/admin/evaluators">
          Evaluators
        </Link>
      </p>
      <h1 className="mt-2 text-3xl tracking-tight">{evaluator.name}</h1>
      <p className="mt-2 text-muted">
        {evaluator.user.email} · {evaluator.country}
        {evaluator.languages.length ? ` · ${evaluator.languages.join(", ")}` : ""}
      </p>
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-card">
        {evaluator.assignedEvaluations.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">No assigned evaluations.</li>
        ) : (
          evaluator.assignedEvaluations.map((evaluation) => (
            <li key={evaluation.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
              <span>
                <span className="block font-medium">{evaluation.prompt}</span>
                <span className="text-sm text-muted">
                  {evaluation.language} · {evaluation.context}
                </span>
              </span>
              <CompanyStatus status={evaluation.status} />
            </li>
          ))
        )}
      </ul>
    </Container>
  )
}
