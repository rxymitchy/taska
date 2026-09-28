"use client"

import { useActionState } from "react"
import { reviewSubmission, type ReviewState } from "@/app/actions/reviews"
import { btnPrimary, btnSecondary, inputClass } from "@/lib/styles"

const initial: ReviewState = { error: "" }

export function ReviewControls({ submissionId }: { submissionId: string }) {
  const [state, action, pending] = useActionState(reviewSubmission, initial)
  return (
    <form action={action} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="submissionId" value={submissionId} />
      <label className="text-xs text-muted">
        Quality
        <input
          className={`${inputClass} mt-1 w-20`}
          name="qualityScore"
          type="number"
          min={0}
          max={100}
          defaultValue={90}
        />
      </label>
      <button className={btnPrimary} name="decision" value="approve" disabled={pending}>
        Approve
      </button>
      <button className={btnSecondary} name="decision" value="reject" disabled={pending}>
        Reject
      </button>
      {state.error ? <p className="w-full text-sm text-bad">{state.error}</p> : null}
    </form>
  )
}
