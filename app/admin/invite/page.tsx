import type { Metadata } from "next"
import { InviteForm, ReviewerLightningForm } from "@/components/invite-form"
import { Container } from "@/components/ui"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"

export const metadata: Metadata = { title: "Invite reviewers" }

export default async function InvitePage() {
  const user = await requireRole(["ADMIN"])
  const me = await prisma.user.findUnique({ where: { id: user.id }, select: { lightningAddress: true } })

  return (
    <Container className="max-w-2xl py-10">
      <h1 className="text-3xl tracking-tight">Invite reviewers</h1>
      <p className="mt-2 text-muted">
        Invite someone who can catch a bad answer. They set a password and get paid when they agree a check.
      </p>
      <div className="mt-8">
        <InviteForm />
      </div>
      <section className="mt-12">
        <h2 className="text-lg">Where you get paid</h2>
        <p className="mt-1 text-sm text-muted">
          Approved reviews pay you here.
        </p>
        <div className="mt-4">
          <ReviewerLightningForm current={me?.lightningAddress ?? ""} />
        </div>
      </section>
    </Container>
  )
}
