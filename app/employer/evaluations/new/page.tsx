import type { Metadata } from "next"
import Link from "next/link"
import { CompanyEvaluationForm } from "@/components/company-evaluation-form"
import { Container } from "@/components/ui"
import { formatSats } from "@/lib/money"
import { companyCostPerEvaluation } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "New evaluation" }

export default async function NewEvaluationPage() {
  const user = await requireRole(["EMPLOYER"])
  const company = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  const cost = companyCostPerEvaluation()

  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-3xl tracking-tight">New AI evaluation</h1>
      <p className="mt-2 text-muted">
        Type the question. Leave the AI response blank to generate one, or paste an answer yourself. This holds{" "}
        {formatSats(cost)} from your credits
        {company ? ` (${formatSats(company.prepaidSats)} available)` : ""}.{" "}
        <Link className="text-accent underline" href="/employer/credits">
          Add credits
        </Link>
        {" · "}
        <Link className="text-accent underline" href="/employer/upload">
          Upload many
        </Link>
      </p>
      <div className="mt-8">
        <CompanyEvaluationForm />
      </div>
    </Container>
  )
}
