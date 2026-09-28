"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { approveSubmission, rejectSubmission } from "@/services/reviews"

export type ReviewState = { error: string }

async function assertCanReview(userId: string, role: "ADMIN" | "EMPLOYER", submissionId: string) {
  const submission = await prisma.taskSubmission.findUnique({
    where: { id: submissionId },
    include: { task: { include: { employer: true } } },
  })
  if (!submission) throw new Error("Submission not found")
  if (role === "ADMIN") return submission
  if (submission.task.employer.userId !== userId) {
    throw new Error("You can only review work on your own tasks")
  }
  return submission
}

export async function reviewSubmission(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const user = await requireRole(["ADMIN", "EMPLOYER"])
  const submissionId = String(formData.get("submissionId") ?? "")
  const decision = String(formData.get("decision") ?? "")
  try {
    await assertCanReview(user.id, user.role === "ADMIN" ? "ADMIN" : "EMPLOYER", submissionId)
    if (decision === "approve") {
      const qualityScore = Number(formData.get("qualityScore") ?? 90)
      await approveSubmission(submissionId, qualityScore)
    } else if (decision === "reject") {
      await rejectSubmission(submissionId)
    } else {
      return { error: "Choose approve or reject." }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Review failed." }
  }

  revalidatePath("/admin")
  revalidatePath("/employer")
  revalidatePath("/dashboard")
  revalidatePath("/tasks")
  return { error: "" }
}
