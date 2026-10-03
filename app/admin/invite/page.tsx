import type { Metadata } from "next"
import { InviteForm, ReviewerLightningForm } from "@/components/invite-form"
import { Container } from "@/components/ui"
import { prisma } from "@/lib/prisma"
import { canReview } from "@/lib/reviewer-access"
import { requireCanInvite } from "@/lib/session"

export const metadata: Metadata = { title: "Invite reviewers" }

export default async function InvitePage() {
  const user = await requireCanInvite()
  const reviewer = await canReview(user)
  const me = await prisma.user.findUnique({ where: { id: user.id }, select: { lightningAddress: true } })

  return (
    <Container className="page-frame max-w-2xl!">
      <h1 className="text-3xl tracking-tight">Invite reviewers</h1>
      <p className="mt-2 text-muted">
        Invite someone who can catch a bad answer. They set a password and get paid when they agree a check. A
        company or evaluator can send this invite — you do not need a seed admin account.
      </p>
      <div className="mt-8">
          <div className="form-surface mt-6">
            <InviteForm />
          </div>
      </div>
      {reviewer ? (
        <section className="mt-12">
          <h2 className="text-lg">Where you get paid</h2>
          <p className="mt-1 text-sm text-muted">
            Approved reviews pay you here.
          </p>
          <div className="mt-4">
            <ReviewerLightningForm current={me?.lightningAddress ?? ""} />
          </div>
        </section>
      ) : null}
    </Container>
  )
}
