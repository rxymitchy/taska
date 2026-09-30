import type { Metadata } from "next"
import Link from "next/link"
import { UploadForm } from "@/components/upload-form"
import { Container } from "@/components/ui"
import { formatSats } from "@/lib/money"
import { companyCostPerEvaluation, MAX_UPLOAD_ROWS } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Upload evaluations" }

export default async function UploadPage() {
  const user = await requireRole(["EMPLOYER"])
  const company = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!company) return null
  const cost = companyCostPerEvaluation()

  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-3xl tracking-tight">Upload many answers</h1>
      <p className="mt-2 text-muted">
        CSV or JSON, up to {MAX_UPLOAD_ROWS} rows. Each row is one answer someone will check, and holds{" "}
        {formatSats(cost)} so they can be paid. You have {formatSats(company.prepaidSats)} available.{" "}
        <Link className="text-accent underline" href="/employer/credits">
          Add credit
        </Link>
      </p>
      <div className="mt-6 rounded-lg border border-line bg-card p-4 text-sm">
        <p className="font-medium">CSV columns</p>
        <p className="mt-1 text-muted">prompt, language, context, aiResponse (optional)</p>
        <pre className="mt-3 overflow-x-auto text-xs text-muted">{`prompt,language,context,aiResponse
Ninaweza kutumia M-Pesa kulipa bili hii?,Swahili,Kenya / M-Pesa,`}</pre>
        <p className="mt-3 font-medium">JSON</p>
        <pre className="mt-1 overflow-x-auto text-xs text-muted">{`[{ "prompt": "…", "language": "Yoruba", "context": "Nigeria / bank transfer", "aiResponse": "" }]`}</pre>
      </div>
      <div className="mt-8">
        <UploadForm />
      </div>
    </Container>
  )
}
