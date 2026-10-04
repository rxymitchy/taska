import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { loginAdmin } from "@/app/actions/auth"
import { LoginForm } from "@/components/login-form"
import { AuthShell } from "@/components/auth-shell"
import { auth } from "@/auth"
import { canReview } from "@/lib/reviewer-access"

export const metadata: Metadata = { title: "Admin" }

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await auth()
  if (session?.user && (await canReview(session.user))) {
    redirect("/admin")
  }

  const params = await searchParams
  const callbackUrl =
    params.callbackUrl?.startsWith("/admin") && !params.callbackUrl.startsWith("//")
      ? params.callbackUrl
      : "/admin"

  return (
    <AuthShell
      className="admin-auth"
      title="Staff"
      blurb="Reviewers see their assigned checks. Admins can also help companies and evaluators."
    >
      <LoginForm
        action={loginAdmin}
        callbackUrl={callbackUrl}
        emailId="admin-email"
        passwordId="admin-password"
      />
    </AuthShell>
  )
}
