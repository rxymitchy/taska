import type { Metadata } from "next"
import Link from "next/link"
import { SignupForm } from "@/components/signup-form"
import { Container } from "@/components/ui"

export const metadata: Metadata = { title: "Create account" }

export default function SignupPage() {
  return (
    <Container className="max-w-md py-16">
      <h1 className="text-3xl tracking-tight">Create an account</h1>
      <p className="mt-2 text-sm text-muted">
        Already registered?{" "}
        <Link className="text-accent underline" href="/login">
          Log in
        </Link>
      </p>
      <div className="mt-8">
        <SignupForm />
      </div>
    </Container>
  )
}
