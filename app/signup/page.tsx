import type { Metadata } from "next"
import Link from "next/link"
import { SignupForm } from "@/components/signup-form"
import { Container } from "@/components/ui"
import { findOpenInvite } from "@/lib/invites"

export const metadata: Metadata = { title: "Create account" }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; as?: string }>
}) {
  const { invite, as: asParam } = await searchParams
  const openInvite = invite ? await findOpenInvite(invite) : null
  const asCompany = asParam === "company"

  return (
    <Container className="max-w-md py-16">
      <h1 className="text-3xl tracking-tight">
        {openInvite ? "Join as a reviewer" : asCompany ? "Company signup" : "Sign up. Get paid."}
      </h1>
      {invite && !openInvite ? (
        <p className="mt-2 text-sm text-bad">This invite is invalid or has expired.</p>
      ) : openInvite ? (
        <p className="mt-2 text-sm text-muted">
          You double-check the work. If you agree, they get paid — and so do you.
        </p>
      ) : asCompany ? (
        <p className="mt-2 text-sm text-muted">
          Send answers for people to check. They get paid when the work is agreed. Already here?{" "}
          <Link className="text-accent underline" href="/login">
            Log in
          </Link>
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Catch bad slang and local mix-ups. Get paid as you go — even a little still pays. Already here?{" "}
          <Link className="text-accent underline" href="/login">
            Log in
          </Link>
        </p>
      )}
      <div className="mt-8">
        {invite && !openInvite ? null : (
          <SignupForm
            inviteToken={openInvite ? invite : undefined}
            inviteEmail={openInvite?.email}
            asCompany={asCompany}
          />
        )}
      </div>
    </Container>
  )
}
