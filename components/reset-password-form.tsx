"use client"

import { useActionState } from "react"
import { resetPassword, type AuthState } from "@/app/actions/auth"
import { btnPrimary, inputClass, labelClass } from "@/lib/styles"

const initial: AuthState = { error: "" }

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initial)

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="space-y-1.5">
        <span className={labelClass}>New password</span>
        <input
          className={inputClass}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label className="space-y-1.5">
        <span className={labelClass}>Type it again</span>
        <input
          className={inputClass}
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Saving…" : "Save password"}
      </button>
    </form>
  )
}
