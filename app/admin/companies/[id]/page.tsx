import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CompanyStatus } from "@/components/company-status"
import { Container } from "@/components/ui"
import { formatSats } from "@/lib/money"
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
      <h1 className="mt-2 text-3xl tracking-tight">{company.companyName}</h1>
      <p className="mt-2 text-muted">
        {company.user.email} · available {formatSats(company.prepaidSats)} · held {formatSats(company.heldSats)}
      </p>
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-card">
        {company.evaluations.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">No evaluations yet.</li>
        ) : (
          company.evaluations.map((evaluation) => (
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
