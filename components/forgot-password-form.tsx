"use client"

import { useActionState } from "react"
import { requestPasswordReset, type AuthState } from "@/app/actions/auth"
import { btnPrimary, inputClass, labelClass } from "@/lib/styles"

const initial: AuthState = { error: "" }

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial)

  if (state.sent) {
    return (
      <p className="text-sm leading-relaxed">
        If that email is on Taska, we sent a link. Check your inbox — and spam if it is not there.
      </p>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <label className="space-y-1.5">
        <span className={labelClass}>Email</span>
        <input className={inputClass} name="email" type="email" autoComplete="email" required />
      </label>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Sending…" : "Send the link"}
      </button>
    </form>
  )
}
