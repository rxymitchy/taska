import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { loginAdmin } from "@/app/actions/auth"
import { LoginForm } from "@/components/login-form"
import { AuthShell } from "@/components/auth-shell"
import { auth } from "@/auth"
import { canAdmin, canReview } from "@/lib/staff"

export const metadata: Metadata = { title: "Admin" }

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await auth()
  if (session?.user && canAdmin(session.user)) redirect("/admin")
  if (session?.user && canReview(session.user)) redirect("/reviewer")

  const params = await searchParams
  const callbackUrl =
    params.callbackUrl?.startsWith("/admin") && !params.callbackUrl.startsWith("//")
      ? params.callbackUrl
      : "/admin"

  return (
    <AuthShell className="admin-auth" title="Admin" blurb="Sign in to manage people and help with reviews.">
      <LoginForm
        action={loginAdmin}
        callbackUrl={callbackUrl}
        emailId="admin-email"
        passwordId="admin-password"
      />
    </AuthShell>
  )
}
