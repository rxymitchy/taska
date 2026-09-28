import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Avatar, Container, StatusPill } from "@/components/ui"
import { formatDay, formatWhen } from "@/lib/format"
import { portraitFor } from "@/lib/portraits"
import { prisma } from "@/lib/prisma"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const worker = await prisma.workerProfile.findUnique({ where: { id }, select: { name: true } })
  return { title: worker?.name ?? "Worker" }
}

export default async function WorkerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const worker = await prisma.workerProfile.findUnique({
    where: { id },
    include: {
      submissions: {
        where: { status: "APPROVED" },
        orderBy: { reviewedAt: "desc" },
        take: 8,
        include: { task: true },
      },
    },
  })
  if (!worker) notFound()
  const photo = portraitFor(worker.name)

  return (
    <Container className="max-w-3xl py-10">
      <div className="flex gap-5">
        {photo ? (
          <img src={photo} alt="" className="h-28 w-24 shrink-0 rounded-xl object-cover object-top" />
        ) : (
          <Avatar name={worker.name} size="lg" />
        )}
        <div>
          <h1 className="text-4xl tracking-tight">{worker.name}</h1>
          <p className="mt-1 text-muted">{worker.country}</p>
          <p className="mt-1 text-sm text-muted">Member since {formatDay(worker.createdAt)}</p>
        </div>
      </div>
      {worker.bio ? <p className="mt-6 max-w-2xl leading-relaxed">{worker.bio}</p> : null}
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">Tasks completed</dt>
          <dd className="mt-1 text-2xl">{worker.tasksCompleted}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">Approval rate</dt>
          <dd className="mt-1 text-2xl">
            {worker.tasksCompleted === 0 ? "—" : `${Math.round(worker.approvalRate)}%`}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">Quality score</dt>
          <dd className="mt-1 text-2xl">
            {worker.tasksCompleted === 0 ? "—" : Math.round(worker.qualityScore)}
          </dd>
        </div>
      </dl>
      <div className="mt-8 flex flex-wrap gap-2">
        {worker.skills.map((skill) => (
          <span key={skill} className="rounded-full border border-line px-2 py-1 text-sm">
            {skill}
          </span>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">{worker.languages.join(" · ")}</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {worker.githubUrl ? (
          <a className="text-accent underline" href={worker.githubUrl}>
            GitHub
          </a>
        ) : null}
        {worker.portfolioUrl ? (
          <a className="text-accent underline" href={worker.portfolioUrl}>
            Portfolio
          </a>
        ) : null}
        {worker.cvFileName ? (
          <Link className="text-accent underline" href={`/api/cv/${worker.id}`}>
            CV uploaded
          </Link>
        ) : null}
      </div>
      <section className="mt-10">
        <h2 className="text-xl">Verified work history</h2>
        <p className="mt-1 text-sm text-muted">Approved tasks on Taska, not a generic freelancer badge.</p>
        <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-card">
          {worker.submissions.length === 0 ? (
            <li className="px-4 py-4 text-sm text-muted">No approved work yet.</li>
          ) : (
            worker.submissions.map((submission) => (
              <li key={submission.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium">{submission.task.title}</p>
                  <p className="text-sm text-muted">
                    {submission.reviewedAt ? formatWhen(submission.reviewedAt) : ""}
                    {submission.qualityScore != null ? ` · Quality ${submission.qualityScore}` : ""}
                  </p>
                </div>
                <StatusPill status={submission.status} />
              </li>
            ))
          )}
        </ul>
      </section>
    </Container>
  )
}
