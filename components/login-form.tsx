"use client"

import { useActionState } from "react"
import { login, loginDemo, type AuthState } from "@/app/actions/auth"
import { btnPrimary, btnSecondary, inputClass, labelClass } from "@/lib/styles"

const initial: AuthState = { error: "" }

export function LoginForm({
  callbackUrl,
  demoEnabled,
}: {
  callbackUrl?: string
  demoEnabled: boolean
}) {
  const [state, action, pending] = useActionState(login, initial)
  const [demoState, demoAction, demoPending] = useActionState(loginDemo, initial)

  return (
    <div className="space-y-8">
      <form action={action} className="space-y-4">
        {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
        <label className="space-y-1.5">
          <span className={labelClass}>Email</span>
          <input className={inputClass} name="email" type="email" autoComplete="email" required />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Password</span>
          <input className={inputClass} name="password" type="password" autoComplete="current-password" required />
        </label>
        {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
        <button className={btnPrimary} type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Log in"}
        </button>
      </form>
      {demoEnabled ? (
        <div className="border-t border-line pt-6">
          <p className="text-sm font-medium">Demo accounts</p>
          <p className="mt-1 text-sm text-muted">Password for each is demo1234.</p>
          {demoState.error ? <p className="mt-2 text-sm text-bad">{demoState.error}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={demoAction}>
              <input type="hidden" name="role" value="worker" />
              <button className={btnSecondary} disabled={demoPending}>
                Worker
              </button>
            </form>
            <form action={demoAction}>
              <input type="hidden" name="role" value="employer" />
              <button className={btnSecondary} disabled={demoPending}>
                Employer
              </button>
            </form>
            <form action={demoAction}>
              <input type="hidden" name="role" value="admin" />
              <button className={btnSecondary} disabled={demoPending}>
                Reviewer
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
