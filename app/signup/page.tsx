import type { Metadata } from "next"
import Link from "next/link"
import { SignupForm } from "@/components/signup-form"
import { Container } from "@/components/ui"
import { findOpenInvite } from "@/lib/invites"

export const metadata: Metadata = { title: "Create account" }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>
}) {
  const { invite } = await searchParams
  const openInvite = invite ? await findOpenInvite(invite) : null

  return (
    <Container className="max-w-md py-16">
      <h1 className="text-3xl tracking-tight">{openInvite ? "Join as a reviewer" : "Check answers. Get paid in sats."}</h1>
      {invite && !openInvite ? (
        <p className="mt-2 text-sm text-bad">This invite is invalid or has expired.</p>
      ) : openInvite ? (
        <p className="mt-2 text-sm text-muted">
          You double-check Rita’s work. If you agree, she gets paid — and so do you, to a Lightning address Taska never
          holds the keys for.
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Taska never stores your wallet keys. Already here?{" "}
          <Link className="text-accent underline" href="/login">
            Log in
          </Link>
        </p>
      )}
      <div className="mt-8">
        {invite && !openInvite ? null : (
          <SignupForm inviteToken={openInvite ? invite : undefined} inviteEmail={openInvite?.email} />
        )}
      </div>
    </Container>
  )
}
