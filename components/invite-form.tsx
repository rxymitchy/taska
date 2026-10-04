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
        <span className={labelClass}>Email</span>
        <input className={inputClass} name="email" type="email" required />
      </label>
      <fieldset className="space-y-2">
        <legend className={labelClass}>Role</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="staffKind" value="reviewer" defaultChecked />
          Reviewer — only their assigned reviews and payout wallet
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="staffKind" value="admin" />
          Admin — people, companies, and evaluators
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="staffKind" value="both" />
          Both — admin and reviewer
        </label>
      </fieldset>
      {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
      {state.promoted ? (
        <p className="text-sm">That account already existed. Their staff role was updated. Ask them to log in again.</p>
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
