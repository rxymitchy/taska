"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { login, type AuthState } from "@/app/actions/auth"

const initial: AuthState = { error: "" }

const labelCls = "text-[13px] font-semibold text-[#12382b]"

const inputCls =
  "w-full rounded-2xl border border-[#12382b]/15 bg-[#fbf6ea] px-4 py-3 text-[15px] text-[#12382b] " +
  "placeholder:text-[#3d5a49]/55 transition duration-200 hover:border-[#2f6b53]/40 " +
  "focus:border-[#2f6b53] focus:outline-none focus:ring-4 focus:ring-[#2f6b53]/20"

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(login, initial)
  const [show, setShow] = useState(false)

  return (
    <form action={action} className="space-y-5">
      {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}

      <div className="space-y-1.5">
        <label htmlFor="login-email" className={`block ${labelCls}`}>
          Email
        </label>
        <input
          id="login-email"
          className={inputCls}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="login-password" className={labelCls}>
            Password
          </label>
          <Link
            href="/forgot-password"
            className="rounded text-[13px] font-semibold text-[#2f6b53] underline-offset-4 transition-colors hover:text-[#12382b] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6b53]"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="login-password"
            className={`${inputCls} pr-12`}
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-[#3d5a49] transition hover:bg-[#12382b]/[0.08] hover:text-[#12382b] active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2f6b53]"
          >
            {show ? (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17.94 17.94A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="rounded-2xl border border-[#c8732a]/40 bg-[#fbdcbd] px-4 py-3 text-[14px] font-medium text-[#7a3412]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full border border-[#8fb8a3]/35 bg-[linear-gradient(135deg,#2f6b53,#12382b)] px-7 py-3.5 text-[15px] font-semibold text-[#f7f3e8] shadow-[0_14px_30px_-14px_rgba(18,56,43,.95)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-14px_rgba(18,56,43,1)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6b53]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgba(240,172,110,.35),transparent)] transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden"
        />
        <span className="relative z-10 inline-flex items-center">
          {pending ? (
            <>
              <svg viewBox="0 0 24 24" className="mr-2.5 size-4 animate-spin motion-reduce:animate-none" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                <path d="M12 3a9 9 0 1 0 9 9" />
              </svg>
              Signing in…
            </>
          ) : (
            <>
              Log in
              <span
                aria-hidden="true"
                className="grid h-6 w-0 place-items-center overflow-hidden rounded-full bg-[#f0ac6e] text-[#12382b] opacity-0 transition-all duration-300 ease-out group-hover:ml-3 group-hover:w-6 group-hover:opacity-100 group-focus-visible:ml-3 group-focus-visible:w-6 group-focus-visible:opacity-100"
              >
                <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </>
          )}
        </span>
      </button>
    </form>
  )
}