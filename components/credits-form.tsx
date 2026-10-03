"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { checkCreditDeposit, createCreditInvoice, confirmCreditDeposit, type CreditActionState } from "@/app/actions/credits"
import { btnPrimary, btnSecondary, inputClass, labelClass } from "@/lib/styles"
import { formatSats } from "@/lib/money"

import { CopyInvoiceButton } from "@/components/copy-invoice-button"
import { DownloadReceiptButton } from "@/components/download-receipt-button"
import { InvoiceQr } from "@/components/invoice-qr"
import { CREDIT_PACKS } from "@/lib/credit-packs"
const initial: CreditActionState = { error: "" }

export function CreditsForm({ mock }: { mock: boolean }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createCreditInvoice, initial)
  const [paid, setPaid] = useState(false)
  const [checkError, setCheckError] = useState("")

  useEffect(() => {
    setPaid(false)
    setCheckError("")
  }, [state.depositId])

  useEffect(() => {
    if (!state.depositId || mock || paid) return

    let cancelled = false
    async function tick() {
      const result = await checkCreditDeposit(state.depositId!)
      if (cancelled) return
      if (result.error) setCheckError(result.error)
      if (result.status === "PAID") {
        setPaid(true)
        router.refresh()
      }
    }

    void tick()
    const timer = window.setInterval(() => void tick(), 4000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [mock, paid, router, state.depositId])

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
          <p className="font-medium">{paid ? "Payment received." : "Pay this invoice."}</p>
          {state.checkoutUrl ? (
            <p className="mt-2">
              <a className="text-accent underline" href={state.checkoutUrl} target="_blank" rel="noreferrer">
                Open checkout
              </a>
            </p>
          ) : null}
          <div className="mt-4">
            <InvoiceQr invoice={state.invoice} />
          </div>
          <p className="mt-3 break-all text-muted">{state.invoice}</p>
          <div className="mt-3">
            <CopyInvoiceButton invoice={state.invoice} />
          </div>
          {paid ? (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium">Credits are on your account. You can send work now.</p>
              {state.depositId ? <DownloadReceiptButton depositId={state.depositId} /> : null}
            </div>
          ) : mock ? (
            <p className="mt-2 text-muted">
              Demo payment. You can mark it paid to try the flow.
            </p>
          ) : (
            <p className="mt-2 text-muted">
              Pay from your Lightning wallet. Taska looks for the payment and adds the credit. You can also tap Check
              payment.
            </p>
          )}
          {checkError ? <p className="mt-2 text-sm text-bad">{checkError}</p> : null}
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
