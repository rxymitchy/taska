import type { Metadata } from "next"
import Link from "next/link"
import { Container, StatusPill } from "@/components/ui"
import { formatSats } from "@/lib/money"
import { prisma } from "@/lib/prisma"
import { btnPrimary } from "@/lib/styles"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Employer" }

export default async function EmployerPage() {
  const user = await requireRole(["EMPLOYER", "ADMIN"])
  const employer = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
    include: { tasks: { orderBy: { createdAt: "desc" } } },
  })
  if (!employer && user.role === "ADMIN") {
    return (
      <Container className="py-10">
        <p>Admin accounts review work from the review desk.</p>
        <Link className="text-accent underline" href="/admin">
          Open review
        </Link>
      </Container>
    )
  }
  if (!employer) return null

  const funded = employer.tasks.reduce((sum, task) => sum + task.rewardSats * task.quantity, 0)
  const spent = employer.tasks.reduce((sum, task) => sum + task.rewardSats * task.completedQuantity, 0)

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl tracking-tight">{employer.companyName}</h1>
          <p className="mt-1 text-muted">{employer.companyDescription}</p>
        </div>
        <Link className={btnPrimary} href="/employer/tasks/new">
          Post a task
        </Link>
      </div>
      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-card p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Total budget</dt>
          <dd className="mt-1 text-2xl">{formatSats(funded)}</dd>
        </div>
        <div className="rounded-lg border border-line bg-card p-4">
          <dt className="text-xs uppercase tracking-wider text-muted">Spent on approved work</dt>
          <dd className="mt-1 text-2xl">{formatSats(spent)}</dd>
        </div>
      </dl>
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-card">
        {employer.tasks.map((task) => (
          <li key={task.id}>
            <Link className="flex flex-wrap items-center justify-between gap-3 px-4 py-4" href={`/employer/tasks/${task.id}`}>
              <span>
                <span className="block font-medium">{task.title}</span>
                <span className="text-sm text-muted">
                  {task.completedQuantity} / {task.quantity} completed · {formatSats(task.rewardSats)} each
                </span>
              </span>
              <StatusPill status={task.status} />
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  )
}
