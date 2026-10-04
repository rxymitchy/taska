"use client"

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react"
import { signup, type AuthState } from "@/app/actions/auth"
import { AuthBtn } from "@/components/auth-btn"
import { countries } from "@/lib/catalog"

const initial: AuthState = { error: "" }

const D = "font-(family-name:--landing-display)"
const labelCls = "block text-[13px] font-semibold text-[#12382b]"
const hintCls = "block text-[12px] text-[#3d5a49]"
const inputCls =
  "w-full rounded-2xl border border-[#12382b]/15 bg-[#fbf6ea] px-4 py-3 text-[15px] text-[#12382b] " +
  "placeholder:text-[#3d5a49]/55 transition duration-200 hover:border-[#2f6b53]/40 " +
  "focus:border-[#2f6b53] focus:outline-none focus:ring-4 focus:ring-[#2f6b53]/20 " +
  "read-only:cursor-not-allowed read-only:bg-[#e6ecd0]/70 read-only:text-[#3d5a49]"

const icon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
}

type Role = "WORKER" | "EMPLOYER"

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {children}
      {hint ? <span className={hintCls}>{hint}</span> : null}
    </div>
  )
}

function RoleOption({
  value,
  label,
  tone,
  checked,
  onChange,
  children,
}: {
  value: Role
  label: string
  tone: "evaluator" | "company"
  checked: boolean
  onChange: () => void
  children: ReactNode
}) {
  const look =
    tone === "evaluator"
      ? checked
        ? "border-[#c8732a]/50 bg-[linear-gradient(135deg,#f6c9a0,#f0ac6e_45%,#e0883a)] text-[#12382b] shadow-[0_18px_34px_-16px_rgba(224,136,58,1)]"
        : "border-[#c8732a]/30 bg-[#fbdcbd]/70 text-[#12382b] hover:bg-[#f8cfa5] hover:shadow-[0_18px_34px_-18px_rgba(224,136,58,.9)]"
      : checked
        ? "border-[#8fb8a3]/40 bg-[linear-gradient(135deg,#2f6b53,#12382b)] text-[#f7f3e8] shadow-[0_18px_34px_-16px_rgba(18,56,43,1)]"
        : "border-[#2f6b53]/30 bg-[#d3e6da]/80 text-[#12382b] hover:bg-[#bcd8c8] hover:shadow-[0_18px_34px_-18px_rgba(18,56,43,.7)]"

  const chip = tone === "evaluator" ? "bg-[#12382b] text-[#f6c9a0]" : "bg-[#f0ac6e] text-[#12382b]"

  return (
    <label className="group block cursor-pointer">
      <input type="radio" name="role" value={value} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl border p-4 transition duration-300 hover:-translate-y-1 active:scale-[0.97] peer-focus-visible:outline peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#2f6b53] ${look}`}
      >
        <span className="flex items-start justify-between">
          <span className="grid size-10 place-items-center rounded-full bg-[#12382b]/10 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
            {children}
          </span>
          <span
            aria-hidden="true"
            className={`grid size-6 place-items-center rounded-full transition-all duration-300 ${chip} ${
              checked ? "scale-100 opacity-100" : "scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100"
            }`}
          >
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {checked ? <path d="M3 8.5l3.2 3L13 4.5" /> : <path d="M3 8h10M9 4l4 4-4 4" />}
            </svg>
          </span>
        </span>
        <span className={`${D} text-[19px] font-bold leading-none tracking-[-0.02em]`}>{label}</span>
      </span>
    </label>
  )
}

export function SignupForm({
  inviteToken,
  inviteEmail,
  asCompany = false,
}: {
  inviteToken?: string
  inviteEmail?: string
  asCompany?: boolean
}) {
  const [state, action, pending] = useActionState(signup, initial)
  const [role, setRole] = useState<Role>(asCompany ? "EMPLOYER" : "WORKER")
  const [show, setShow] = useState(false)
  const invited = Boolean(inviteToken)

  // Submitting through startTransition (instead of action={action}) stops React 19
  // from clearing everything the person typed when the server returns an error.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(() => action(data))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {invited ? (
        <>
          <input type="hidden" name="invite" value={inviteToken} />
          <p className="rounded-2xl border border-[#2f6b53]/25 bg-[#d3e6da]/70 px-4 py-3 text-[14px] font-medium text-[#12382b]">
            You were invited to double-check the work — and get paid.
          </p>
        </>
      ) : (
        <fieldset className="space-y-2.5">
          <legend className={`${labelCls} mb-2.5`}>I’m signing up as</legend>
          <div className="grid grid-cols-2 gap-3">
            <RoleOption value="WORKER" label="Evaluator" tone="evaluator" checked={role === "WORKER"} onChange={() => setRole("WORKER")}>
              <svg {...icon} className="size-5">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </RoleOption>
            <RoleOption value="EMPLOYER" label="Company" tone="company" checked={role === "EMPLOYER"} onChange={() => setRole("EMPLOYER")}>
              <svg {...icon} className="size-5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </RoleOption>
          </div>
        </fieldset>
      )}

      <Field id="signup-name" label={invited || role === "WORKER" ? "Name" : "Your name"}>
        <input id="signup-name" className={inputCls} name="name" autoComplete="name" required />
      </Field>

      {!invited && role === "WORKER" ? (
        <Field id="signup-country" label="Country">
          <div className="relative">
            <select id="signup-country" className={`${inputCls} cursor-pointer appearance-none pr-11`} name="country" required defaultValue="">
              <option value="" disabled>
                Select a country
              </option>
              {countries.map((country) => (
                <option key={country}>{country}</option>
              ))}
            </select>
            <svg {...icon} className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#3d5a49]">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </Field>
      ) : null}

      {!invited && role === "EMPLOYER" ? (
        <Field id="signup-company" label="Company">
          <input id="signup-company" className={inputCls} name="companyName" autoComplete="organization" required />
        </Field>
      ) : null}

      {invited ? (
        <Field id="signup-lightning" label="Where you get paid" hint="Where we send your pay.">
          <input id="signup-lightning" className={inputCls} name="lightningAddress" placeholder="name@provider.com" />
        </Field>
      ) : null}

      <Field id="signup-email" label="Email" hint="We'll send a confirmation email.">
        <input
          id="signup-email"
          className={inputCls}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          defaultValue={inviteEmail}
          readOnly={invited}
        />
      </Field>

      <Field id="signup-password" label="Password" hint="At least 8 characters.">
        <div className="relative">
          <input
            id="signup-password"
            className={`${inputCls} pr-12`}
            name="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-[#3d5a49] transition hover:bg-[#12382b]/8 hover:text-[#12382b] active:scale-90 focus-visible:outline focus-visible:outline-[#2f6b53]"
          >
            {show ? (
              <svg {...icon} className="size-5">
                <path d="M17.94 17.94A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22" />
              </svg>
            ) : (
              <svg {...icon} className="size-5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </Field>

      {state.error ? (
        <p role="alert" className="rounded-2xl border border-[#c8732a]/40 bg-[#fbdcbd] px-4 py-3 text-[14px] font-medium text-[#7a3412]">
          {state.error}
        </p>
      ) : null}

      <AuthBtn type="submit" variant="primary" block pending={pending} pendingLabel="Signing you up…">
        Sign me up
      </AuthBtn>
    </form>
  )
}