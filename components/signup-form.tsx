"use client"

import { useActionState, useState } from "react"
import { signup, type AuthState } from "@/app/actions/auth"
import { countries } from "@/lib/catalog"
import { btnPrimary, inputClass, labelClass } from "@/lib/styles"

const initial: AuthState = { error: "" }

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
  const [role, setRole] = useState<"WORKER" | "EMPLOYER">(asCompany ? "EMPLOYER" : "WORKER")
  const invited = Boolean(inviteToken)

  return (
    <form action={action} className="space-y-4">
      {invited ? (
        <>
          <input type="hidden" name="invite" value={inviteToken} />
          <p className="rounded-md border border-line bg-card px-3 py-2 text-sm">
            You were invited to double-check the work — and get paid.
          </p>
        </>
      ) : (
        <fieldset className="space-y-2">
          <legend className={labelClass}>I am a</legend>
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="WORKER"
                checked={role === "WORKER"}
                onChange={() => setRole("WORKER")}
              />
              Speaker — I get paid
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="EMPLOYER"
                checked={role === "EMPLOYER"}
                onChange={() => setRole("EMPLOYER")}
              />
              Company — I send work
            </label>
          </div>
        </fieldset>
      )}
      <label className="space-y-1.5">
        <span className={labelClass}>{invited || role === "WORKER" ? "Name" : "Your name"}</span>
        <input className={inputClass} name="name" required />
      </label>
      {!invited && role === "WORKER" ? (
        <label className="space-y-1.5">
          <span className={labelClass}>Country</span>
          <select className={inputClass} name="country" required defaultValue="">
            <option value="" disabled>
              Select a country
            </option>
            {countries.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </label>
      ) : null}
      {!invited && role === "EMPLOYER" ? (
        <label className="space-y-1.5">
          <span className={labelClass}>Company</span>
          <input className={inputClass} name="companyName" required />
        </label>
      ) : null}
      {invited ? (
        <label className="space-y-1.5">
          <span className={labelClass}>Where you get paid</span>
          <input className={inputClass} name="lightningAddress" placeholder="name@provider.com" />
          <span className="block text-xs text-muted">
            Where we send your pay.
          </span>
        </label>
      ) : null}
      <label className="space-y-1.5">
        <span className={labelClass}>Email</span>
        <input className={inputClass} name="email" type="email" required defaultValue={inviteEmail} readOnly={invited} />
        <span className="block text-xs text-muted">We&apos;ll send a confirmation email.</span>
      </label>
      <label className="space-y-1.5">
        <span className={labelClass}>Password</span>
        <input className={inputClass} name="password" type="password" minLength={8} required />
      </label>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Signing you up…" : "Sign me up"}
      </button>
    </form>
  )
}
