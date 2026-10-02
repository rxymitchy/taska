"use client"

import { useActionState } from "react"
import { createCreditInvoice, confirmCreditDeposit, type CreditActionState } from "@/app/actions/credits"
import { btnPrimary, btnSecondary, inputClass, labelClass } from "@/lib/styles"
import { formatSats } from "@/lib/money"

import { CREDIT_PACKS } from "@/lib/credit-packs"
const initial: CreditActionState = { error: "" }

export function CreditsForm({ mock }: { mock: boolean }) {
  const [state, action, pending] = useActionState(createCreditInvoice, initial)

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <label className="space-y-1.5">
          <span className={labelClass}>Credit pack</span>
          <select className={inputClass} name="amountSats" defaultValue="1000">
            {CREDIT_PACKS.map((pack) => (
              <option key={pack} value={String(pack)}>
                {formatSats(pack)}
              </option>
            ))}
          </select>
        </label>
        {state.error ? <p className="text-sm text-bad">{state.error}</p> : null}
        <button className={btnPrimary} disabled={pending}>
          {pending ? "Creating invoice…" : "Get invoice"}
        </button>
      </form>
      {state.invoice ? (
        <div className="rounded-lg border border-line bg-card p-4 text-sm">
          <p className="font-medium">Pay this invoice.</p>
          {state.checkoutUrl ? (
            <p className="mt-2">
              <a className="text-accent underline" href={state.checkoutUrl} target="_blank" rel="noreferrer">
                Open checkout
              </a>
            </p>
          ) : null}
          <p className="mt-2 break-all text-muted">{state.invoice}</p>
          {mock ? (
            <p className="mt-2 text-muted">
              Demo payment. You can mark it paid to try the flow.
            </p>
          ) : (
            <p className="mt-2 text-muted">Pay from your wallet, then check payment.</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function ConfirmDepositButton({ depositId, mock }: { depositId: string; mock: boolean }) {
  return (
    <form action={confirmCreditDeposit}>
      <input type="hidden" name="depositId" value={depositId} />
      <button className={btnSecondary} type="submit">
        {mock ? "Mark paid (demo)" : "Check payment"}
      </button>
    </form>
  )
}
