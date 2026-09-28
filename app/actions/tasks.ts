"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { EvaluationChoice } from "@/lib/evaluation-bank"
import { evaluationBank, scoreEvaluation } from "@/lib/evaluation-bank"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"
import { requireRole } from "@/lib/session"
import { evaluationSchema, taskSchema } from "@/lib/validators"
import { approveSubmission } from "@/services/reviews"

export type SubmitState =
  | { error: string; result?: undefined }
  | {
      error?: undefined
      result: {
        status: "APPROVED" | "PENDING"
        qualityScore: number | null
        amountSats: number
        paymentHash: string | null
        taskTitle: string
      }
    }

function skillList(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 12)
}

export async function createTask(_prev: { error: string }, formData: FormData) {
  const user = await requireRole(["EMPLOYER"])
  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!employer) return { error: "Employer profile not found." }

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    instructions: formData.get("instructions"),
    rewardSats: formData.get("rewardSats"),
    quantity: formData.get("quantity"),
    language: formData.get("language"),
    requiredSkills: formData.get("requiredSkills"),
    estimatedMinutes: formData.get("estimatedMinutes"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the task details." }
  }

  const interactive = parsed.data.category === "AI Evaluation"
  const task = await prisma.task.create({
    data: {
      employerId: employer.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      instructions: parsed.data.instructions,
      rewardSats: parsed.data.rewardSats,
      quantity: parsed.data.quantity,
      language: parsed.data.language,
      requiredSkills: skillList(parsed.data.requiredSkills),
      estimatedMinutes: parsed.data.estimatedMinutes,
      status: "FUNDED",
      taskType: interactive ? "AI_RESPONSE_EVALUATION" : "GENERIC",
      autoApprove: false,
      items: interactive
        ? {
            create: Array.from({ length: parsed.data.quantity }, (_, index) => {
              const item = evaluationBank[index % evaluationBank.length]
              return {
                prompt: item.prompt,
                responseA: item.responseA,
                responseB: item.responseB,
                referenceChoice: item.referenceChoice,
              }
            }),
          }
        : undefined,
    },
  })

  revalidatePath("/tasks")
  revalidatePath("/employer")
  redirect(`/employer/tasks/${task.id}`)
}

export async function startTask(formData: FormData) {
  const user = await requireRole(["WORKER"])
  const taskId = String(formData.get("taskId") ?? "")
  const worker = await prisma.workerProfile.findUnique({ where: { userId: user.id } })
  if (!worker) redirect("/profile")

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task || task.status === "CLOSED") redirect("/tasks")
  if (task.taskType !== "AI_RESPONSE_EVALUATION") redirect(`/tasks/${taskId}`)

  const existing = await prisma.taskItem.findFirst({
    where: { taskId, assignedWorkerId: worker.id, status: "ASSIGNED" },
  })
  if (!existing) {
    const next = await prisma.taskItem.findFirst({
      where: { taskId, status: "AVAILABLE" },
      orderBy: { id: "asc" },
    })
    if (!next) redirect(`/tasks/${taskId}?full=1`)
    const claimed = await prisma.taskItem.updateMany({
      where: { id: next.id, status: "AVAILABLE" },
      data: { status: "ASSIGNED", assignedWorkerId: worker.id, assignedAt: new Date() },
    })
    if (claimed.count !== 1) redirect(`/tasks/${taskId}`)
  }

  redirect(`/tasks/${taskId}/work`)
}

export async function submitEvaluation(formData: FormData): Promise<SubmitState> {
  const user = await requireRole(["WORKER"])
  const limit = rateLimit(`submit:${user.id}`, 30, 60 * 60 * 1000)
  if (!limit.ok) return { error: "Too many submissions. Try again later." }

  const parsed = evaluationSchema.safeParse({
    taskItemId: formData.get("taskItemId"),
    choice: formData.get("choice"),
    reason: formData.get("reason") || undefined,
  })
  if (!parsed.success) return { error: "Choose a response before submitting." }

  const worker = await prisma.workerProfile.findUnique({ where: { userId: user.id } })
  if (!worker) return { error: "Create your worker profile first." }
  if (!worker.lightningAddress) {
    return { error: "Add a Lightning address on your profile before submitting." }
  }

  const item = await prisma.taskItem.findUnique({
    where: { id: parsed.data.taskItemId },
    include: { task: true },
  })
  if (!item || item.assignedWorkerId !== worker.id || item.status !== "ASSIGNED") {
    return { error: "This assignment is no longer open." }
  }

  const locked = await prisma.taskItem.updateMany({
    where: { id: item.id, status: "ASSIGNED", assignedWorkerId: worker.id },
    data: { status: "SUBMITTED" },
  })
  if (locked.count !== 1) return { error: "This assignment is no longer open." }

  const submission = await prisma.taskSubmission.create({
    data: {
      taskId: item.taskId,
      taskItemId: item.id,
      workerId: worker.id,
      answers: {
        choice: parsed.data.choice,
        reason: parsed.data.reason ?? "",
      },
      status: "PENDING",
    },
  })

  let status: "APPROVED" | "PENDING" = "PENDING"
  let qualityScore: number | null = null
  let paymentHash: string | null = null

  if (item.task.autoApprove) {
    qualityScore = scoreEvaluation(
      parsed.data.choice as EvaluationChoice,
      (item.referenceChoice as EvaluationChoice | null) ?? null,
      parsed.data.reason ?? "",
    )
    const payment = await approveSubmission(submission.id, qualityScore)
    status = "APPROVED"
    paymentHash = payment.paymentReference
  }

  revalidatePath("/dashboard")
  revalidatePath("/tasks")
  revalidatePath(`/tasks/${item.taskId}`)
  revalidatePath("/admin")
  revalidatePath("/employer")

  return {
    result: {
      status,
      qualityScore,
      amountSats: item.task.rewardSats,
      paymentHash,
      taskTitle: item.task.title,
    },
  }
}
