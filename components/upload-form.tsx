"use client"

import { useActionState } from "react"
import { uploadEvaluations } from "@/app/actions/upload"
import { btnPrimary, inputClass, labelClass } from "@/lib/styles"

export function UploadForm() {
  const [state, action, pending] = useActionState(uploadEvaluations, { error: "" })
  return (
    <form action={action} className="space-y-4">
      <label className="space-y-1.5">
        <span className={labelClass}>CSV or JSON file</span>
        <input className={inputClass} name="file" type="file" accept=".csv,.json,text/csv,application/json" required />
      </label>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Uploading…" : "Upload evaluations"}
      </button>
    </form>
  )
}
