"use client"

import { useActionState, useState } from "react"
import { signup, type AuthState } from "@/app/actions/auth"
import { countries } from "@/lib/catalog"
import { btnPrimary, inputClass, labelClass } from "@/lib/styles"

const initial: AuthState = { error: "" }

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, initial)
  const [role, setRole] = useState<"WORKER" | "EMPLOYER">("WORKER")

  return (
    <form action={action} className="space-y-4">
      <fieldset className="space-y-2">
        <legend className={labelClass}>I want to</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="WORKER"
              checked={role === "WORKER"}
              onChange={() => setRole("WORKER")}
            />
            Evaluate AI responses
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="EMPLOYER"
              checked={role === "EMPLOYER"}
              onChange={() => setRole("EMPLOYER")}
            />
            Submit AI responses for evaluation
          </label>
        </div>
      </fieldset>
      <label className="space-y-1.5">
        <span className={labelClass}>{role === "WORKER" ? "Name" : "Your name"}</span>
        <input className={inputClass} name="name" required />
      </label>
      {role === "WORKER" ? (
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
      ) : (
        <label className="space-y-1.5">
          <span className={labelClass}>Company</span>
          <input className={inputClass} name="companyName" required />
        </label>
      )}
      <label className="space-y-1.5">
        <span className={labelClass}>Email</span>
        <input className={inputClass} name="email" type="email" required />
      </label>
      <label className="space-y-1.5">
        <span className={labelClass}>Password</span>
        <input className={inputClass} name="password" type="password" minLength={8} required />
      </label>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  )
}
