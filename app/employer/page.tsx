import type { Metadata } from "next"
import Link from "next/link"
import { Container, StatusPill } from "@/components/ui"
import { prisma } from "@/lib/prisma"
import { btnPrimary } from "@/lib/styles"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Company" }

export default async function EmployerPage() {
  const user = await requireRole(["EMPLOYER", "ADMIN"])
  const company = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
    include: { evaluations: { orderBy: { createdAt: "desc" } } },
  })
  if (!company && user.role === "ADMIN") {
    return (
      <Container className="py-10">
        <p>Review completed evaluations from the review queue.</p>
        <Link className="text-accent underline" href="/admin">
          Open review
        </Link>
      </Container>
    )
  }
  if (!company) return null

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl tracking-tight">{company.companyName}</h1>
          <p className="mt-1 text-muted">AI evaluations you have submitted.</p>
        </div>
        <Link className={btnPrimary} href="/employer/evaluations/new">
          New evaluation
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-card">
        {company.evaluations.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">No evaluations yet.</li>
        ) : (
          company.evaluations.map((evaluation) => (
            <li key={evaluation.id}>
              <Link className="flex flex-wrap items-center justify-between gap-3 px-4 py-4" href={`/employer/evaluations/${evaluation.id}`}>
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
