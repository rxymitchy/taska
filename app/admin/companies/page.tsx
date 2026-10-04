import type { Metadata } from "next"
import Link from "next/link"
import { Container, StatusPill } from "@/components/ui"
import { notDemoCompanyWhere } from "@/lib/demo-accounts"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "Companies" }

export default async function AdminCompaniesPage() {
  await requireAdmin()
  const companies = await prisma.employerProfile.findMany({
    where: notDemoCompanyWhere(),
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { email: true } },
      evaluations: { select: { id: true, status: true }, orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { evaluations: true } },
    },
  })

  return (
    <Container className="page-frame max-w-3xl!">
      <h1 className="text-3xl tracking-tight">Companies</h1>
      <p className="mt-2 text-muted">Look in if a company needs help. You are not acting as that company.</p>
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-card">
        {companies.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">No companies yet.</li>
        ) : (
          companies.map((company) => (
            <li key={company.id}>
              <Link className="flex flex-wrap items-center justify-between gap-3 px-4 py-4" href={`/admin/companies/${company.id}`}>
                <span>
                  <span className="block font-medium">{company.companyName}</span>
                  <span className="text-sm text-muted">
                    {company.user.email} · {company._count.evaluations} evaluations
                  </span>
                </span>
                {company.evaluations[0] ? <StatusPill status={company.evaluations[0].status} /> : null}
              </Link>
            </li>
          ))
        )}
      </ul>
    </Container>
  )
}
