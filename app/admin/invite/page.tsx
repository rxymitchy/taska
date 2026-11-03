import type { Metadata } from "next"
import Link from "next/link"
import { promoteEvaluatorToReviewer } from "@/app/actions/invites"
import { InviteForm, ReviewerLightningForm } from "@/components/invite-form"
import { Container, PageHeader, Panel } from "@/components/ui"
import { notDemoEmailWhere } from "@/lib/demo-accounts"
import { prisma } from "@/lib/prisma"
import { btnSecondary } from "@/lib/styles"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "Invite reviewers" }

export default async function InvitePage() {
  const user = await requireAdmin()
  const [me, evaluators] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id }, select: { lightningAddress: true } }),
    prisma.user.findMany({
      where: {
        role: "WORKER",
        workerProfile: { isNot: null },
        ...notDemoEmailWhere(),
      },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        email: true,
        workerProfile: { select: { name: true, country: true, languages: true } },
      },
    }),
  ])

  return (
    <Container className="page-frame max-w-2xl!">
      <PageHeader
        title="Invite staff"
        description="Invite a reviewer, an admin, or both."
      />
      <p className="mt-4 text-sm">
        <Link className="text-accent underline" href="/admin/people">
          Fix roles on People
        </Link>
      </p>
      <div className="form-surface mt-10">
        <InviteForm />
      </div>
      <section className="mt-12">
        <h2 className="text-lg tracking-tight">Promote an evaluator</h2>
        <p className="mt-1 text-sm text-muted">They keep their profile. They stop receiving new evaluation work.</p>
        {evaluators.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No evaluators to promote yet.</p>
        ) : (
          <Panel className="mt-4">
          <ul className="divide-y divide-[#12382b]/8">
            {evaluators.map((evaluator) => (
              <li key={evaluator.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
                <span>
                  <span className="block font-medium">{evaluator.workerProfile?.name || evaluator.email}</span>
                  <span className="text-muted">
                    {evaluator.email}
                    {evaluator.workerProfile?.country ? ` · ${evaluator.workerProfile.country}` : ""}
                    {evaluator.workerProfile?.languages.length
                      ? ` · ${evaluator.workerProfile.languages.join(", ")}`
                      : ""}
                  </span>
                </span>
                <form action={promoteEvaluatorToReviewer} className="flex flex-wrap gap-2">
                  <input type="hidden" name="userId" value={evaluator.id} />
                  <button className={btnSecondary} name="staffKind" value="reviewer">
                    Reviewer
                  </button>
                  <button className={btnSecondary} name="staffKind" value="both">
                    Both
                  </button>
                </form>
              </li>
            ))}
          </ul>
          </Panel>
        )}
      </section>
      <section className="mt-12">
        <h2 className="text-lg">Where you get paid</h2>
        <p className="mt-1 text-sm text-muted">Approved reviews pay you here.</p>
        <div className="mt-4">
          <ReviewerLightningForm current={me?.lightningAddress ?? ""} />
        </div>
      </section>
    </Container>
  )
}
