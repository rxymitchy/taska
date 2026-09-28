import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { startTask } from "@/app/actions/tasks"
import { Container, StatusPill } from "@/components/ui"
import { auth } from "@/auth"
import { formatSats, formatUsd } from "@/lib/money"
import { prisma } from "@/lib/prisma"
import { btnPrimary } from "@/lib/styles"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const task = await prisma.task.findUnique({ where: { id }, select: { title: true } })
  return { title: task?.title ?? "Task" }
}

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ full?: string }>
}) {
  const { id } = await params
  const query = await searchParams
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) notFound()
  const session = await auth()
  const available = Math.max(task.quantity - task.completedQuantity, 0)
  const interactive = task.taskType === "AI_RESPONSE_EVALUATION"
  const budget = task.rewardSats * task.quantity

  return (
    <Container className="max-w-3xl py-10">
      <p className="text-sm text-muted">{task.category}</p>
      <h1 className="mt-2 text-4xl tracking-tight">{task.title}</h1>
      <p className="mt-4 leading-relaxed text-muted">{task.description}</p>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-card p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Reward</dt>
          <dd className="mt-1 text-lg font-medium">
            {formatSats(task.rewardSats)} <span className="text-sm text-muted">≈ {formatUsd(task.rewardSats)}</span>
          </dd>
        </div>
        <div className="rounded-lg border border-line bg-card p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Estimated time</dt>
          <dd className="mt-1 text-lg font-medium">~{task.estimatedMinutes} min</dd>
        </div>
        <div className="rounded-lg border border-line bg-card p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Available</dt>
          <dd className="mt-1 text-lg font-medium">
            {available} of {task.quantity}
          </dd>
        </div>
        <div className="rounded-lg border border-line bg-card p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Language</dt>
          <dd className="mt-1 text-lg font-medium">{task.language}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-muted">
        Skills: {task.requiredSkills.join(", ")} · Budget {formatSats(budget)} · <StatusPill status={task.status} />
      </p>
      <section className="mt-8">
        <h2 className="text-xl">Instructions</h2>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed">{task.instructions}</p>
      </section>
      {query.full ? <p className="mt-6 text-sm text-warn">No assignments are left on this task.</p> : null}
      <div className="mt-8">
        {!interactive ? (
          <p className="text-sm text-muted">
            This category is listed so you can see the kind of work Taska is for. The task you can complete in the demo is AI Response Evaluation.
          </p>
        ) : !session ? (
          <Link className={btnPrimary} href={`/login?callbackUrl=/tasks/${task.id}`}>
            Log in to start
          </Link>
        ) : session.user.role !== "WORKER" ? (
          <p className="text-sm text-muted">Switch to a worker account to complete this task.</p>
        ) : available === 0 ? (
          <p className="text-sm text-muted">All assignments on this task are finished.</p>
        ) : (
          <form action={startTask}>
            <input type="hidden" name="taskId" value={task.id} />
            <button className={btnPrimary}>Start task</button>
          </form>
        )}
      </div>
    </Container>
  )
}
