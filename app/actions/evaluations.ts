"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { aiEvaluationSchema, humanEvaluationSchema } from "@/lib/validators"
import { assignEvaluation } from "@/services/assignment"
import { recordPendingLightningPayouts } from "@/services/settlement"

export async function createEvaluation(_prev: { error: string }, formData: FormData) {
  const user = await requireRole(["EMPLOYER"])
  const company = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!company) return { error: "Company profile not found." }

  const parsed = aiEvaluationSchema.safeParse({
    prompt: formData.get("prompt"),
    aiResponse: formData.get("aiResponse"),
    language: formData.get("language"),
    context: formData.get("context"),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the evaluation." }

  const created = await prisma.evaluation.create({
    data: {
      companyId: company.id,
      prompt: parsed.data.prompt,
      aiResponse: parsed.data.aiResponse,
      language: parsed.data.language,
      context: parsed.data.context,
      status: "PENDING",
    },
  })
  await assignEvaluation(created.id)

  revalidatePath("/employer")
  revalidatePath("/dashboard")
  redirect(`/employer/evaluations/${created.id}`)
}

export async function submitHumanEvaluation(_prev: { error: string }, formData: FormData) {
  const user = await requireRole(["WORKER"])
  const worker = await prisma.workerProfile.findUnique({ where: { userId: user.id } })
  if (!worker) return { error: "Evaluator profile not found." }

  const parsed = humanEvaluationSchema.safeParse({
    evaluationId: formData.get("evaluationId"),
    factuallyCorrect: formData.get("factuallyCorrect"),
    languageNatural: formData.get("languageNatural"),
    understandsContext: formData.get("understandsContext"),
    betterAnswer: formData.get("betterAnswer") || undefined,
    comment: formData.get("comment") || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Answer each question." }

  const evaluation = await prisma.evaluation.findUnique({ where: { id: parsed.data.evaluationId } })
  if (!evaluation || evaluation.assignedWorkerId !== worker.id || evaluation.status !== "ASSIGNED") {
    return { error: "This evaluation is not assigned to you." }
  }

  const answers = {
    factuallyCorrect: parsed.data.factuallyCorrect === "yes",
    languageNatural: parsed.data.languageNatural === "yes",
    understandsContext: parsed.data.understandsContext === "yes",
    betterAnswer: "",
    comment: parsed.data.comment ?? "",
  }
  if (!answers.factuallyCorrect || !answers.languageNatural || !answers.understandsContext) {
    answers.betterAnswer = parsed.data.betterAnswer ?? ""
  }

  const existing = await prisma.evaluationSubmission.findFirst({
    where: { evaluationId: evaluation.id, workerId: worker.id },
    orderBy: { submittedAt: "desc" },
  })
  if (existing) {
    await prisma.evaluationSubmission.update({ where: { id: existing.id }, data: { ...answers, submittedAt: new Date(), reviewedAt: null, reviewerUserId: null } })
  } else {
    await prisma.evaluationSubmission.create({ data: { evaluationId: evaluation.id, workerId: worker.id, ...answers } })
  }

  await prisma.evaluation.update({
    where: { id: evaluation.id },
    data: { status: "WORKER_COMPLETED" },
  })

  await prisma.evaluation.update({
    where: { id: evaluation.id },
    data: { status: "UNDER_REVIEW" },
  })

  revalidatePath("/dashboard")
  revalidatePath("/admin")
  revalidatePath(`/employer/evaluations/${evaluation.id}`)
  redirect(`/dashboard/evaluations/${evaluation.id}`)
}

export async function decideEvaluation(formData: FormData) {
  const reviewer = await requireRole(["ADMIN"])
  const evaluationId = String(formData.get("evaluationId") ?? "")
  const decision = String(formData.get("decision") ?? "")
  if (decision !== "approve" && decision !== "reject") redirect("/admin")

  const evaluation = await prisma.evaluation.findUnique({
    where: { id: evaluationId },
    include: { assignedWorker: true, submissions: { orderBy: { submittedAt: "desc" }, take: 1 } },
  })
  if (!evaluation || evaluation.status !== "UNDER_REVIEW" || !evaluation.assignedWorker || !evaluation.submissions[0]) {
    redirect("/admin")
  }

  const submission = evaluation.submissions[0]
  if (decision === "reject") {
    await prisma.evaluationSubmission.update({
      where: { id: submission.id },
      data: { reviewedAt: new Date(), reviewerUserId: reviewer.id },
    })
    await prisma.evaluation.update({
      where: { id: evaluation.id },
      data: { status: "ASSIGNED" },
    })
    revalidatePath("/admin")
    revalidatePath("/dashboard")
    revalidatePath(`/employer/evaluations/${evaluation.id}`)
    redirect("/admin")
  }

  await prisma.evaluationSubmission.update({
    where: { id: submission.id },
    data: { reviewedAt: new Date(), reviewerUserId: reviewer.id },
  })
  await prisma.evaluation.update({
    where: { id: evaluation.id },
    data: { status: "APPROVED" },
  })
  await prisma.evaluation.update({
    where: { id: evaluation.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  })
  await recordPendingLightningPayouts({
    evaluationId: evaluation.id,
    workerUserId: evaluation.assignedWorker.userId,
    reviewerUserId: reviewer.id,
  })

  revalidatePath("/admin")
  revalidatePath("/dashboard")
  revalidatePath(`/employer/evaluations/${evaluation.id}`)
  redirect("/admin")
}
