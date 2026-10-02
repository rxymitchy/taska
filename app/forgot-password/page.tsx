import type { Metadata } from "next"
import Link from "next/link"
import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { Container } from "@/components/ui"

export const metadata: Metadata = { title: "Forgot password" }

export default function ForgotPasswordPage() {
  return (
    <Container className="page-frame">
      <section className="form-surface mx-auto w-full max-w-md">
        <h1 className="text-3xl tracking-tight">Forgot password</h1>
        <p className="mt-2 text-sm text-muted">
          We will email you a link to choose a new one. Remembered it?{" "}
          <Link className="font-bold text-accent underline underline-offset-4" href="/login">
            Log in
          </Link>
        </p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
      </section>
    </Container>
  )
}
