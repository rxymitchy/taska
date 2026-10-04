import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { loginReviewer } from "@/app/actions/auth"
import { LoginForm } from "@/components/login-form"
import { ReviewerLightningForm } from "@/components/invite-form"
import { SignupForm } from "@/components/signup-form"
import { AuthShell } from "@/components/auth-shell"
import { LightningPending } from "@/components/lightning-pending"
import { Container, StatusPill } from "@/components/ui"
import { auth } from "@/auth"
import { notDemoCompanyWhere } from "@/lib/demo-accounts"
import { findOpenInvite } from "@/lib/invites"
import { prisma } from "@/lib/prisma"
import { canAdmin, canReview, homeForUser } from "@/lib/staff"
import { requireReviewer } from "@/lib/session"
import { assignReviewer } from "@/services/assignment"

export const metadata: Metadata = { title: "Reviewer" }
export const maxDuration = 60

export default async function ReviewerPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; callbackUrl?: string }>
}) {
  const session = await auth()
  const params = await searchParams

  if (session?.user) {
    if (canReview(session.user)) return <ReviewerQueue />
    if (canAdmin(session.user)) redirect("/admin")
    redirect(homeForUser(session.user))
  }

  const invite = params.invite
  const openInvite = invite ? await findOpenInvite(invite) : null
  const invalidInvite = Boolean(invite && !openInvite)

  if (invite) {
    return (
      <AuthShell
        className="admin-auth"
        compact
        title="Reviewer"
        blurb={invalidInvite ? undefined : "You double-check the work. If you agree, they get paid — and so do you."}
      >
        {invalidInvite ? (
          <p role="alert" className="rounded-2xl border border-[#c8732a]/40 bg-[#fbdcbd] px-4 py-3 text-[14px] font-medium text-[#7a3412]">
            This invite is invalid or has expired.
          </p>
        ) : (
          <SignupForm inviteToken={invite} inviteEmail={openInvite?.email} />
        )}
      </AuthShell>
    )
  }

  const callbackUrl =
    params.callbackUrl?.startsWith("/reviewer") && !params.callbackUrl.startsWith("//")
      ? params.callbackUrl
      : "/reviewer"

  return (
    <AuthShell className="admin-auth" title="Reviewer" blurb="Sign in to see the checks assigned to you.">
      <LoginForm
        action={loginReviewer}
        callbackUrl={callbackUrl}
        emailId="reviewer-email"
        passwordId="reviewer-password"
      />
    </AuthShell>
  )
}

async function ReviewerQueue() {
  const user = await requireReviewer()
  const adminReviewer = canAdmin(user)
  const unassigned = await prisma.evaluation.findMany({
    where: { status: "UNDER_REVIEW", reviewerUserId: null, company: notDemoCompanyWhere() },
    select: { id: true },
    take: 20,
  })
  for (const row of unassigned) await assignReviewer(row.id)

  const [queue, payouts, me] = await Promise.all([
    prisma.evaluation.findMany({
      where: {
        status: "UNDER_REVIEW",
        company: notDemoCompanyWhere(),
        ...(adminReviewer ? {} : { reviewerUserId: user.id }),
      },
      orderBy: { createdAt: "asc" },
      include: { company: true },
    }),
    prisma.evaluationPayout.findMany({
      where: { payeeUserId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.findUnique({ where: { id: user.id }, select: { lightningAddress: true } }),
  ])

  return (
    <Container className="page-frame">
      <h1 className="text-3xl tracking-tight">{adminReviewer ? "Review queue" : "Your reviews"}</h1>
      <p className="mt-2 text-muted">
        {adminReviewer
          ? "If you agree, they get paid. If you don’t, it comes back and nobody is charged."
          : "These checks were assigned to you. Add where you get paid, then review."}
      </p>
      <section className="form-surface mt-6 max-w-xl">
        <h2 className="text-lg">Where you get paid</h2>
        <p className="mt-1 text-sm text-muted">Approved reviews pay this wallet.</p>
        <div className="mt-4">
          <ReviewerLightningForm current={me?.lightningAddress ?? ""} />
        </div>
      </section>
      {payouts.length > 0 ? (
        <div className="mt-6 space-y-2">
          {payouts.map((payout) => (
            <LightningPending key={payout.id} who="Reviewer" status={payout.status} amountSats={payout.amountSats} />
          ))}
        </div>
      ) : null}
      <ul className="mt-8 divide-y divide-line rounded-lg border border-line bg-card">
        {queue.length === 0 ? (
          <li className="px-4 py-4 text-sm text-muted">
            {adminReviewer
              ? "Nothing is waiting for review. An evaluator has to submit a check first."
              : "No reviews are assigned to you yet."}
          </li>
        ) : (
          queue.map((evaluation) => (
            <li key={evaluation.id}>
              <Link className="flex flex-wrap items-center justify-between gap-3 px-4 py-4" href={`/reviewer/evaluations/${evaluation.id}`}>
                <span>
                  <span className="block font-medium">{evaluation.prompt}</span>
                  <span className="text-sm text-muted">
                    {evaluation.company.companyName} · {evaluation.language} · {evaluation.context}
                  </span>
                </span>
                <StatusPill status={evaluation.status} />
              </Link>
            </li>
          ))
        )}
      </ul>
    </Container>
  )
}
