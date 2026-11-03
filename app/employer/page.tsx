import type { Metadata } from "next"
import Link from "next/link"
import { CompanyStatus } from "@/components/company-status"
import { Container, EmptyState, PageHeader, Panel, SatsAmount, StatCard } from "@/components/ui"
import { formatSats } from "@/lib/money"
import { companyCostPerEvaluation } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { btnPrimary, btnSecondary } from "@/lib/styles"
import { requireRole } from "@/lib/session"
import { assignOpenCompanyEvaluations } from "@/services/assignment"

export const metadata: Metadata = { title: "Company" }

export default async function EmployerPage() {
  const user = await requireRole(["EMPLOYER", "ADMIN"])
  const existing = await prisma.employerProfile.findUnique({ where: { userId: user.id }, select: { id: true } })
  if (existing) {
    try {
      await assignOpenCompanyEvaluations(existing.id)
    } catch {
      // Still show the company page if assignment is slow.
    }
  }
  const company = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
    include: { evaluations: { orderBy: { createdAt: "desc" } } },
  })
  if (!company && user.role === "ADMIN") {
    return (
      <Container className="page-frame">
        <p className="text-muted">Review completed evaluations from the review queue.</p>
        <Link className="mt-4 inline-flex text-accent underline" href="/admin">
          Open admin
        </Link>
      </Container>
    )
  }
  if (!company) return null
  const cost = companyCostPerEvaluation()
  const needsCredit = company.prepaidSats < cost

  return (
    <Container className="page-frame">
      <PageHeader
        title={company.companyName}
        description="Send an answer to check, then watch it move from waiting to done."
        actions={
          <>
            <Link className={needsCredit ? btnPrimary : btnSecondary} href="/employer/credits">
              {needsCredit ? "Add credit to get started" : "Add credit"}
            </Link>
            <Link className={needsCredit ? btnSecondary : btnPrimary} href="/employer/evaluations/new">
              Check an answer
            </Link>
          </>
        }
      />

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard label="Available credit">
          <SatsAmount sats={company.prepaidSats} />
        </StatCard>
        <StatCard label="Held for open work">
          <SatsAmount sats={company.heldSats} />
        </StatCard>
        <StatCard label="Cost per check">
          <SatsAmount sats={cost} />
        </StatCard>
      </dl>

      <section className="mt-12" aria-labelledby="evaluations-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 id="evaluations-heading" className="text-xl tracking-tight">
            Recent evaluations
          </h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link className="font-medium text-[#12382b]/70 underline-offset-4 hover:text-[#12382b] hover:underline" href="/employer/upload">
              Upload a batch
            </Link>
            {company.evaluations.some((evaluation) => evaluation.status === "COMPLETED") ? (
              <>
                <Link className="font-medium text-[#12382b]/70 underline-offset-4 hover:text-[#12382b] hover:underline" href="/api/employer/export?format=csv">
                  Download CSV
                </Link>
                <Link className="font-medium text-[#12382b]/70 underline-offset-4 hover:text-[#12382b] hover:underline" href="/api/employer/export?format=json">
                  Download JSON
                </Link>
              </>
            ) : null}
          </div>
        </div>
        <Panel>
          {company.evaluations.length === 0 ? (
            <EmptyState
              title="No evaluations yet"
              body="Start with one answer, or upload a file if you have many to check."
              action={
                <Link className={btnPrimary} href="/employer/evaluations/new">
                  Check an answer
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-[#12382b]/8">
              {company.evaluations.map((evaluation) => (
                <li key={evaluation.id}>
                  <Link
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#12382b]/4"
                    href={`/employer/evaluations/${evaluation.id}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{evaluation.prompt}</span>
                      <span className="text-sm text-muted">
                        {evaluation.language} · {evaluation.context}
                      </span>
                    </span>
                    <CompanyStatus status={evaluation.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted">
          Each new evaluation holds {formatSats(cost)} from your available credit. If a check is sent back, that hold
          comes back to you.
        </p>
      </section>
    </Container>
  )
}
