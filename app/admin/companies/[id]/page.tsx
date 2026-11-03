import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CompanyStatus } from "@/components/company-status"
import { Container, PageHeader, Panel, SatsAmount, StatCard } from "@/components/ui"
import { isDemoAccountEmail } from "@/lib/demo-accounts"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "Company" }

export default async function AdminCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const company = await prisma.employerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { email: true } },
      evaluations: { orderBy: { createdAt: "desc" }, take: 40 },
    },
  })
  if (!company || isDemoAccountEmail(company.user.email)) notFound()

  return (
    <Container className="page-frame max-w-3xl!">
      <p className="text-sm text-muted">
        <Link className="text-accent underline" href="/admin/companies">
          Companies
        </Link>
      </p>
      <PageHeader title={company.companyName} description={company.user.email} />
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <StatCard label="Available">
          <SatsAmount sats={company.prepaidSats} />
        </StatCard>
        <StatCard label="Held">
          <SatsAmount sats={company.heldSats} />
        </StatCard>
      </dl>
      <Panel className="mt-8">
      <ul className="divide-y divide-[#12382b]/8">
        {company.evaluations.length === 0 ? (
          <li className="px-5 py-4 text-sm text-muted">No evaluations yet.</li>
        ) : (
          company.evaluations.map((evaluation) => (
            <li key={evaluation.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
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
      </Panel>
    </Container>
  )
}
