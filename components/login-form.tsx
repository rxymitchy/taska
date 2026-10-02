"use client"

import Link from "next/link"
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
      <form action={action} className="space-y-5">
        {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
        <label className="space-y-1.5">
          <span className={labelClass}>Email</span>
          <input className={inputClass} name="email" type="email" autoComplete="email" required />
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center justify-between gap-3">
            <span className={labelClass}>Password</span>
            <Link className="text-sm font-bold text-accent underline underline-offset-4" href="/forgot-password">
              Forgot password?
            </Link>
          </span>
          <input className={inputClass} name="password" type="password" autoComplete="current-password" required />
        </label>
        {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
        <button className={`${btnPrimary} w-full`} type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Log in"}
        </button>
      </form>
      {demoEnabled ? (
        <div className="border-t border-line pt-6">
          <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-muted">
            <span className="h-px flex-1 bg-line" />
            <span>Try it</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <p className="mt-1 text-sm text-muted">
            Company sends an answer. Rita checks it. Reviewer agrees. You get paid. Password for each is demo1234.
          </p>
          {demoState.error ? <p className="mt-2 text-sm text-bad">{demoState.error}</p> : null}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <form action={demoAction} className="w-full">
              <input type="hidden" name="role" value="worker" />
              <button className={`${btnSecondary} w-full`} disabled={demoPending}>
                Rita
              </button>
            </form>
            <form action={demoAction} className="w-full">
              <input type="hidden" name="role" value="employer" />
              <button className={`${btnSecondary} w-full`} disabled={demoPending}>
                Company
              </button>
            </form>
            <form action={demoAction} className="w-full">
              <input type="hidden" name="role" value="admin" />
              <button className={`${btnSecondary} w-full`} disabled={demoPending}>
                Reviewer
              </button>
            </form>
          </div>
          <p className="mt-5 text-sm font-medium">Different languages</p>
          <p className="mt-1 text-sm text-muted">Same password. Open the person who speaks that language.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <form action={demoAction} className="w-full">
              <input type="hidden" name="role" value="rita" />
              <button className={`${btnSecondary} w-full`} disabled={demoPending}>
                Rita · Swahili
              </button>
            </form>
            <form action={demoAction} className="w-full">
              <input type="hidden" name="role" value="chinedu" />
              <button className={`${btnSecondary} w-full`} disabled={demoPending}>
                Chinedu · Yoruba
              </button>
            </form>
            <form action={demoAction} className="w-full">
              <input type="hidden" name="role" value="ama" />
              <button className={`${btnSecondary} w-full`} disabled={demoPending}>
                Ama · Twi
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
