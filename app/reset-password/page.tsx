import type { Metadata } from "next"
import Link from "next/link"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { Container } from "@/components/ui"
import { findOpenReset } from "@/lib/password-reset"

export const metadata: Metadata = { title: "Reset password" }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const open = token ? await findOpenReset(token) : null

  return (
    <Container className="max-w-md py-16">
      <h1 className="text-3xl tracking-tight">Choose a new password</h1>
      {!token || !open ? (
        <p className="mt-2 text-sm text-bad">
          This link is invalid or has expired.{" "}
          <Link className="text-accent underline" href="/forgot-password">
            Ask for a new one.
          </Link>
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted">Use 8 or more characters.</p>
          <div className="mt-8">
            <ResetPasswordForm token={token} />
          </div>
        </>
      )}
    </Container>
  )
}
