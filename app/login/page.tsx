import type { Metadata } from "next"
import { AuthBtn } from "@/components/auth-btn"
import { AuthShell } from "@/components/auth-shell"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = { title: "Log in" }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const params = await searchParams
  const callbackUrl =
    params.callbackUrl?.startsWith("/") && !params.callbackUrl.startsWith("//")
      ? params.callbackUrl
      : undefined

  return (
    <AuthShell
      title="Log in"
      blurb="Help train AI in your language, or get your answers checked."
      prompt="New here?"
      cta={
        <AuthBtn href="/signup" variant="primary" size="sm">
          Sign me up
        </AuthBtn>
      }
    >
      <LoginForm callbackUrl={callbackUrl} />
    </AuthShell>
  )
}