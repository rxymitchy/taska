import Link from "next/link"
import { formatSats, formatUsd } from "@/lib/money"
import { btnSecondary } from "@/lib/styles"

export function TaskCard({
  task,
}: {
  task: {
    id: string
    title: string
    category: string
    rewardSats: number
    estimatedMinutes: number
    quantity: number
    completedQuantity: number
    language: string
    requiredSkills: string[]
    taskType: string
    autoApprove: boolean
  }
}) {
  const available = Math.max(task.quantity - task.completedQuantity, 0)
  return (
    <article className="flex h-full flex-col rounded-lg border border-line bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl leading-snug tracking-tight">{task.title}</h2>
          <p className="mt-1 text-sm text-muted">{task.category}</p>
        </div>
        {task.taskType === "AI_RESPONSE_EVALUATION" && !task.autoApprove ? (
          <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-xs text-muted">Reviewed first</span>
        ) : null}
      </div>
      <p className="mt-4 text-sm">
        <span className="font-semibold">{formatSats(task.rewardSats)}</span>
        <span className="text-muted"> ≈ {formatUsd(task.rewardSats)}</span>
      </p>
      <p className="mt-1 text-sm text-muted">~{task.estimatedMinutes} min</p>
      <p className="mt-4 text-sm">{available} tasks available</p>
      <p className="mt-1 text-sm text-muted">{task.language}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {task.requiredSkills.slice(0, 3).map((skill) => (
          <span key={skill} className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-auto pt-4">
        <Link className={btnSecondary} href={`/tasks/${task.id}`}>
          View task
        </Link>
      </div>
    </article>
  )
}
