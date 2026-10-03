"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { holdCompanyCredits, releaseEvaluationHold, spendEvaluationHold } from "@/lib/credits"
import { companyCostPerEvaluation } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { requireReviewer, requireRole } from "@/lib/session"
import { aiEvaluationSchema, humanEvaluationSchema } from "@/lib/validators"
import { assignEvaluation } from "@/services/assignment"
import { generateAiResponse, precheckAiResponse } from "@/services/ai"
import { payoutDestinationsReady, recordPendingLightningPayouts } from "@/services/settlement"
import { payableLightningDestination, usesLiveLightning } from "@/lib/payout-destination"

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

  let aiResponse = parsed.data.aiResponse ?? ""
  let aiModel = "pasted"
  if (aiResponse.length < 4) {
    const generated = await generateAiResponse({
      prompt: parsed.data.prompt,
      language: parsed.data.language,
      context: parsed.data.context,
    })
    if (!generated?.text) return { error: "Could not generate a response. Paste one and try again." }
    aiResponse = generated.text
    aiModel = generated.model
  }
  const aiPrecheck = await precheckAiResponse({
    prompt: parsed.data.prompt,
    response: aiResponse,
    language: parsed.data.language,
    context: parsed.data.context,
  })

  const held = await holdCompanyCredits(company.id, 1, "New evaluation")
  if ("error" in held && held.error) return { error: held.error }

  const created = await prisma.evaluation.create({
    data: {
      companyId: company.id,
      prompt: parsed.data.prompt,
      aiResponse,
      aiModel,
      aiPrecheckFactuallyCorrect: aiPrecheck?.factuallyCorrect,
      aiPrecheckLanguageNatural: aiPrecheck?.languageNatural,
      aiPrecheckUnderstandsContext: aiPrecheck?.understandsContext,
      aiPrecheckModel: aiPrecheck?.model,
      language: parsed.data.language,
      context: parsed.data.context,
      status: "PENDING",
      heldSats: companyCostPerEvaluation(),
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
  if (!worker.lightningAddress?.trim()) {
    return { error: "Add where you get paid on your profile before you submit." }
  }
  if (usesLiveLightning() && !payableLightningDestination(worker.lightningAddress)) {
    return { error: "Add a real pay address (not a demo placeholder) so we can pay you." }
  }

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
  const reviewer = await requireReviewer()
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
  if (decision === "approve") {
    const ready = await payoutDestinationsReady({
      workerUserId: evaluation.assignedWorker.userId,
      reviewerUserId: reviewer.id,
    })
    if (!ready.ok) {
      redirect(`/admin/evaluations/${evaluation.id}?pay=need-address`)
    }
  }
  if (decision === "reject") {
    await prisma.evaluationSubmission.update({
      where: { id: submission.id },
      data: { reviewedAt: new Date(), reviewerUserId: reviewer.id },
    })
    await prisma.evaluation.update({
      where: { id: evaluation.id },
      data: { status: "ASSIGNED" },
    })
    await releaseEvaluationHold(evaluation.id)
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
  await spendEvaluationHold(evaluation.id)
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
