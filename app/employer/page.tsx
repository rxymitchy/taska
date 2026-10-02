import type { Metadata } from "next"
import Link from "next/link"
import { Container, StatusPill } from "@/components/ui"
import { formatSats } from "@/lib/money"
import { companyCostPerEvaluation } from "@/lib/pricing"
import { prisma } from "@/lib/prisma"
import { btnPrimary, btnSecondary } from "@/lib/styles"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Company" }

export default async function EmployerPage() {
  const user = await requireRole(["EMPLOYER", "ADMIN"])
  const company = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
    include: { evaluations: { orderBy: { createdAt: "desc" }, include: { assignedWorker: { select: { name: true } } } } },
  })
  if (!company && user.role === "ADMIN") {
    return (
      <Container className="py-10">
        <p>Review completed evaluations from the review queue.</p>
        <Link className="text-accent underline" href="/admin">
          Open review
        </Link>
      </Container>
    )
  }
  if (!company) return null
  const cost = companyCostPerEvaluation()

  return (
    <Container className="page-frame">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-xs font-semibold uppercase text-accent">Company workspace</p>
          <h1 className="mt-1 text-3xl tracking-tight sm:text-4xl">{company.companyName}</h1>
          <p className="mt-2 text-sm text-muted">Manage evaluations, review progress, and keep work funded.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className={company.prepaidSats < cost ? btnPrimary : btnSecondary} href="/employer/credits">
            {company.prepaidSats < cost ? "Add credit to get started" : "Add credit"}
          </Link>
          <Link className={company.prepaidSats < cost ? btnSecondary : btnPrimary} href="/employer/evaluations/new">
            Check an answer
          </Link>
        </div>
      </div>
      <dl className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        <div className="lagoon-dark-panel px-4 py-4 text-white">
          <dt className="text-xs font-bold uppercase text-white/75">Available credit</dt>
          <dd className="mt-2"><span className="inline-flex rounded-md bg-hl px-2 py-1 font-display text-2xl tabular-nums text-ink">{formatSats(company.prepaidSats)}</span></dd>
        </div>
        <div className="bg-card px-4 py-4">
          <dt className="text-xs font-medium uppercase text-muted">Held for open work</dt>
          <dd className="mt-2"><span className="inline-flex rounded-md bg-hl px-2 py-1 font-display text-2xl tabular-nums text-ink">{formatSats(company.heldSats)}</span></dd>
        </div>
        <div className="bg-card px-4 py-4">
          <dt className="text-xs font-medium uppercase text-muted">Cost per evaluation</dt>
          <dd className="mt-2"><span className="inline-flex rounded-md bg-hl px-2 py-1 font-display text-2xl tabular-nums text-ink">{formatSats(cost)}</span></dd>
        </div>
      </dl>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <section aria-labelledby="evaluations-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-accent">Activity</p>
              <h2 id="evaluations-heading" className="mt-1 text-xl tracking-tight">Recent evaluations</h2>
            </div>
            <span className="text-sm text-muted">{company.evaluations.length} total</span>
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line bg-card">
        {company.evaluations.length === 0 ? (
          <li className="px-4 py-6">
            <p className="font-medium">No evaluations yet</p>
            <p className="mt-1 text-sm text-muted">Start with one answer or upload a batch to create your first checks.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="text-sm font-semibold text-accent underline underline-offset-4" href="/employer/evaluations/new">Create evaluation</Link>
              <Link className="text-sm font-semibold text-accent underline underline-offset-4" href="/employer/upload">Upload a batch</Link>
            </div>
          </li>
        ) : (
          company.evaluations.map((evaluation) => (
            <li key={evaluation.id}>
              <Link className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 transition hover:bg-paper/70" href={`/employer/evaluations/${evaluation.id}`}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{evaluation.prompt}</span>
                  <span className="text-sm text-muted">
                    {evaluation.language} · {evaluation.context}
                    {evaluation.assignedWorker ? ` · ${evaluation.assignedWorker.name}` : " · waiting for someone"}
                  </span>
                </span>
                <StatusPill status={evaluation.status} />
              </Link>
            </li>
          ))
        )}
          </ul>
        </section>
        <aside className="space-y-7">
          <section className="border-t border-line pt-5">
            <p className="text-xs font-semibold uppercase text-muted">Scale your review</p>
            <h2 className="mt-1 text-lg font-medium">Upload a batch</h2>
            <p className="mt-1 text-sm text-muted">Create multiple evaluations from a CSV or JSON file.</p>
            <Link className="mt-4 inline-flex text-sm font-semibold text-accent underline underline-offset-4" href="/employer/upload">
              Upload evaluations
            </Link>
          </section>
          <section className="border-t border-line pt-5">
            <p className="text-xs font-semibold uppercase text-muted">How billing works</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Each new evaluation holds {formatSats(cost)} from your available credit. Open work is shown separately above.
            </p>
            <Link className="mt-3 inline-flex text-sm font-semibold text-accent underline underline-offset-4" href="/employer/credits">
              Review credit activity
            </Link>
          </section>
        </aside>
      </div>
    </Container>
  )
}
