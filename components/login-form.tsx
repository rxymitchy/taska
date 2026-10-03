"use client"

import Link from "next/link"
import { useActionState } from "react"
import { login, type AuthState } from "@/app/actions/auth"
import { inputClass, labelClass } from "@/lib/styles"

const initial: AuthState = { error: "" }

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(login, initial)

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gradient-to-br from-green-100 via-white to-amber-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-green-100 bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-green-900">Welcome back</h1>

        <form action={action} className="space-y-5">
          {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}

          <label className="block space-y-1.5">
            <span className={labelClass}>Email</span>
            <input className={inputClass} name="email" type="email" autoComplete="email" required />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between gap-3">
              <span className={labelClass}>Password</span>
              <Link
                className="text-sm font-semibold text-slate-600 underline underline-offset-4 transition hover:text-green-700"
                href="/forgot-password"
              >
                Forgot password?
              </Link>
            </span>
            <input className={inputClass} name="password" type="password" autoComplete="current-password" required />
          </label>

          {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-green-700 via-yellow-500 to-amber-500 px-4 py-3 font-bold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:brightness-110 active:translate-y-0 active:scale-[0.98] disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Log in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span>New here?</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <Link
          href="/register"
          className="block w-full rounded-xl border-2 border-transparent bg-white px-4 py-3 text-center font-bold text-green-900 shadow-sm transition duration-200 [background:linear-gradient(white,white)_padding-box,linear-gradient(to_right,#15803d,#eab308,#d97706)_border-box] hover:-translate-y-0.5 hover:shadow-lg hover:brightness-105 active:translate-y-0 active:scale-[0.98]"
        >
          Sign me up
        </Link>
      </div>
    </div>
  )
}
