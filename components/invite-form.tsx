"use client"

import { useActionState } from "react"
import { inviteReviewer, saveReviewerLightning, type InviteState } from "@/app/actions/invites"
import { btnPrimary, inputClass, labelClass } from "@/lib/styles"

const inviteInitial: InviteState = { error: "" }

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteReviewer, inviteInitial)
  return (
    <form action={action} className="space-y-4">
      <label className="space-y-1.5">
        <span className={labelClass}>Reviewer email</span>
        <input className={inputClass} name="email" type="email" required />
      </label>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      {state.promoted ? (
        <p className="text-sm">They were an evaluator. They are a reviewer now. Ask them to refresh and open Review queue.</p>
      ) : null}
      {state.inviteUrl ? (
        <p className="break-all rounded-md border border-line bg-card px-3 py-2 text-sm">
          {state.emailed ? "Invite emailed. Link: " : "Invite created. Email did not send — copy this link: "}
          {state.inviteUrl}
        </p>
      ) : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Creating invite…" : "Create invite"}
      </button>
    </form>
  )
}

export function ReviewerLightningForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState(saveReviewerLightning, { error: "" })
  return (
    <form action={action} className="space-y-4">
      <label className="space-y-1.5">
        <span className={labelClass}>Where you get paid</span>
        <input
          className={inputClass}
          name="lightningAddress"
          defaultValue={current}
          placeholder="name@provider.com"
        />
        <span className="block text-xs text-muted">We only store this address.</span>
      </label>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      <button className={btnPrimary} disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  )
}
