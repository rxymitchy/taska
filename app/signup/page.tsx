import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthBtn } from "@/components/auth-btn"
import { AuthShell } from "@/components/auth-shell"
import { SignupForm } from "@/components/signup-form"

export const metadata: Metadata = { title: "Create account" }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; as?: string }>
}) {
  const { invite, as: asParam } = await searchParams
  if (invite) redirect(`/reviewer?invite=${encodeURIComponent(invite)}`)
  const asCompany = asParam === "company"

  return (
    <AuthShell
      compact
      title="Create your account"
      blurb="Evaluators catch bad slang and local mix-ups. Companies send answers to be checked."
      prompt="Already here?"
      cta={
        <AuthBtn href="/login" variant="secondary" size="sm">
          Log in
        </AuthBtn>
      }
    >
      <SignupForm key={asCompany ? "company" : "evaluator"} asCompany={asCompany} />
    </AuthShell>
  )
}
