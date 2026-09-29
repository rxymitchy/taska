import type { Metadata } from "next"
import { CompanyEvaluationForm } from "@/components/company-evaluation-form"
import { Container } from "@/components/ui"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "New evaluation" }

export default async function NewEvaluationPage() {
  await requireRole(["EMPLOYER"])
  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-3xl tracking-tight">New AI evaluation</h1>
      <p className="mt-2 text-muted">Paste the question and the AI response. Language and context tell the evaluator what to judge.</p>
      <div className="mt-8">
        <CompanyEvaluationForm />
      </div>
    </Container>
  )
}
