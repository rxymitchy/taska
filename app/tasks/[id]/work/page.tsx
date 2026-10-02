import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { EvaluationClient } from "@/components/evaluation-client"
import { Container } from "@/components/ui"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Complete task" }

function isRecentSubmission(submittedAt: Date) {
  return Date.now() - submittedAt.getTime() < 15 * 60 * 1000
}

export default async function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireRole(["WORKER"])
  const worker = await prisma.workerProfile.findUnique({ where: { userId: user.id } })
  if (!worker) redirect("/profile")

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) notFound()
  if (task.taskType !== "AI_RESPONSE_EVALUATION") redirect(`/tasks/${id}`)

  const item = await prisma.taskItem.findFirst({
    where: { taskId: id, assignedWorkerId: worker.id, status: "ASSIGNED" },
    select: { id: true, prompt: true, responseA: true, responseB: true },
  })
  const recent = item
    ? null
    : await prisma.taskSubmission.findFirst({
        where: { taskId: id, workerId: worker.id },
        orderBy: { submittedAt: "desc" },
        include: { payment: { include: { lightningPayment: true } }, task: true },
      })
  const recentResult =
    recent &&
    (recent.status === "APPROVED" || recent.status === "PENDING") &&
    isRecentSubmission(recent.submittedAt)
      ? {
          status: recent.status,
          qualityScore: recent.qualityScore,
          amountSats: recent.task.rewardSats,
          paymentHash: recent.payment?.paymentReference ?? null,
          taskTitle: recent.task.title,
        }
      : null

  return (
    <Container className="max-w-3xl py-10">
      <p className="text-sm text-muted">{task.category}</p>
      <h1 className="mt-2 text-3xl tracking-tight">{task.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{task.instructions}</p>
      {!worker.lightningAddress ? (
        <p className="mt-4 text-sm text-warn">
          Add a Lightning address on your <Link className="underline" href="/profile">profile</Link> before you submit.
        </p>
      ) : null}
      <div className="mt-8">
        {item || recentResult ? (
          <EvaluationClient item={item} initialResult={recentResult} />
        ) : (
          <p className="text-muted">
            You do not have an open assignment.{" "}
            <Link className="text-accent underline" href={`/tasks/${id}`}>
              Go back to the task
            </Link>
            .
          </p>
        )}
      </div>
    </Container>
  )
}
