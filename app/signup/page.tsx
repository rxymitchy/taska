import type { Metadata } from "next"
import { AuthBtn } from "@/components/auth-btn"
import { AuthShell } from "@/components/auth-shell"
import { SignupForm } from "@/components/signup-form"
import { findOpenInvite } from "@/lib/invites"

export const metadata: Metadata = { title: "Create account" }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; as?: string }>
}) {
  const { invite, as: asParam } = await searchParams
  const openInvite = invite ? await findOpenInvite(invite) : null
  const invalidInvite = Boolean(invite && !openInvite)
  const asCompany = asParam === "company"

  const title = openInvite ? "Join as a reviewer" : "Create your account"
  const blurb = invalidInvite
    ? undefined
    : openInvite
      ? "You double-check the work. If you agree, they get paid — and so do you."
      : "Evaluators catch bad slang and local mix-ups. Companies send answers to be checked."

  return (
    <AuthShell
      compact
      title={title}
      blurb={blurb}
      prompt="Already have an account?"
      cta={
        <AuthBtn href="/login" variant="secondary" size="sm">
          Log in
        </AuthBtn>
      }
    >
      {invalidInvite ? (
        <p role="alert" className="rounded-2xl border border-[#c8732a]/40 bg-[#fbdcbd] px-4 py-3 text-[14px] font-medium text-[#7a3412]">
          This invite is invalid or has expired.
        </p>
      ) : (
        <SignupForm
          key={asCompany ? "company" : "evaluator"}
          inviteToken={openInvite ? invite : undefined}
          inviteEmail={openInvite?.email}
          asCompany={asCompany}
        />
      )}
    </AuthShell>
  )
}