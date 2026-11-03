import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { startTask } from "@/app/actions/tasks"
import { Container, PageHeader, SatsAmount, StatCard, StatusPill } from "@/components/ui"
import { auth } from "@/auth"
import { formatSats } from "@/lib/money"
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
    <Container className="page-frame max-w-3xl!">
      <p className="text-sm text-muted">{task.category}</p>
      <PageHeader title={task.title} description={task.description} />
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <StatCard label="Reward">
          <SatsAmount sats={task.rewardSats} />
        </StatCard>
        <StatCard label="Estimated time">
          <p className="font-display text-3xl tracking-tight">~{task.estimatedMinutes} min</p>
        </StatCard>
        <StatCard label="Available">
          <p className="font-display text-3xl tracking-tight">
            {available} of {task.quantity}
          </p>
        </StatCard>
        <StatCard label="Language">
          <p className="font-display text-3xl tracking-tight">{task.language}</p>
        </StatCard>
      </dl>
      <p className="mt-5 text-sm leading-relaxed text-muted">
        Skills: {task.requiredSkills.join(", ")} · Budget {formatSats(budget)} · <StatusPill status={task.status} />
      </p>
      <section className="content-surface mt-8">
        <h2 className="text-xl">Instructions</h2>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed">{task.instructions}</p>
      </section>
      {query.full ? <p className="mt-6 rounded-md border border-line bg-paper px-3 py-2 text-sm text-muted">No assignments are left on this task.</p> : null}
      <div className="mt-8">
        {!interactive ? (
          <p className="text-sm text-muted">
            This category is listed so you can see the kind of work Taska is for. AI Response Evaluation can be completed here.
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
