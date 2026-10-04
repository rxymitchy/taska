import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { ReviewEvaluationView } from "@/components/review-evaluation-view"
import { prisma } from "@/lib/prisma"
import { canAdmin } from "@/lib/staff"
import { requireReviewer } from "@/lib/session"

export const metadata: Metadata = { title: "Review evaluation" }
export const maxDuration = 60

export default async function ReviewerEvaluationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ pay?: string }>
}) {
  const user = await requireReviewer()
  const { id } = await params
  const { pay } = await searchParams
  const evaluation = await prisma.evaluation.findUnique({
    where: { id },
    include: { submissions: { orderBy: { submittedAt: "desc" }, take: 1 }, assignedWorker: true },
  })
  if (!evaluation) notFound()
  if (evaluation.status !== "UNDER_REVIEW") redirect("/reviewer")
  if (!canAdmin(user) && evaluation.reviewerUserId && evaluation.reviewerUserId !== user.id) {
    redirect("/reviewer")
  }
  const answers = evaluation.submissions[0]
  if (!answers) redirect("/reviewer")

  return <ReviewEvaluationView evaluation={evaluation} answers={answers} pay={pay} />
}
