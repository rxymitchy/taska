import { redirect } from "next/navigation"
import { canReview } from "@/lib/staff"
import { requireAdmin } from "@/lib/session"

export default async function AdminEvaluationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ pay?: string }>
}) {
  const user = await requireAdmin()
  if (!canReview(user)) redirect("/admin")
  const { id } = await params
  const { pay } = await searchParams
  redirect(pay ? `/reviewer/evaluations/${id}?pay=${encodeURIComponent(pay)}` : `/reviewer/evaluations/${id}`)
}
