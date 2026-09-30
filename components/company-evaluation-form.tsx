"use client"

import { useActionState } from "react"
import { createEvaluation } from "@/app/actions/evaluations"
import { contexts, languages } from "@/lib/catalog"
import { btnPrimary, inputClass, labelClass } from "@/lib/styles"

export function CompanyEvaluationForm() {
  const [state, action, pending] = useActionState(createEvaluation, { error: "" })
  return (
    <form action={action} className="space-y-4">
      <label className="space-y-1.5">
        <span className={labelClass}>Question or prompt</span>
        <textarea className={inputClass} name="prompt" rows={3} required placeholder="Ninaweza kutumia M-Pesa kulipa bili hii?" />
      </label>
      <label className="space-y-1.5">
        <span className={labelClass}>AI response</span>
          <textarea
            className={inputClass}
            name="aiResponse"
            rows={5}
            placeholder="Leave blank to generate. Or paste the AI answer."
          />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className={labelClass}>Language</span>
          <select className={inputClass} name="language" defaultValue="Swahili">
            {languages.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Context</span>
          <select className={inputClass} name="context" defaultValue="Kenya / M-Pesa">
            {contexts.map((context) => (
              <option key={context}>{context}</option>
            ))}
          </select>
        </label>
      </div>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Sending…" : "Send to check"}
      </button>
    </form>
  )
}
