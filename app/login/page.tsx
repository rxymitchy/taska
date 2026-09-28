import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"
import { Container } from "@/components/ui"

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
    <Container className="max-w-md py-16">
      <h1 className="text-3xl tracking-tight">Log in</h1>
      <p className="mt-2 text-sm text-muted">
        New here?{" "}
        <Link className="text-accent underline" href="/signup">
          Create an account
        </Link>
      </p>
      <div className="mt-8">
        <LoginForm callbackUrl={callbackUrl} demoEnabled={process.env.DEMO_LOGIN === "true"} />
      </div>
    </Container>
  )
}
