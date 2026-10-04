"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { checkCreditDeposit, createCreditInvoice, confirmCreditDeposit, type CreditActionState } from "@/app/actions/credits"
import { btnPrimary, btnSecondary, inputClass, labelClass } from "@/lib/styles"
import { formatSats, formatUsd } from "@/lib/money"

import { CopyInvoiceButton } from "@/components/copy-invoice-button"
import { DownloadReceiptButton } from "@/components/download-receipt-button"
import { InvoiceQr } from "@/components/invoice-qr"
import { CREDIT_PACKS } from "@/lib/credit-packs"
const initial: CreditActionState = { error: "" }

function cardListPriceSats(pack: number) {
  return Math.round(pack / 0.9)
}

export function CreditsForm({ mock }: { mock: boolean }) {
  const [method, setMethod] = useState<"lightning" | "card">("lightning")

  return (
    <div className="space-y-5">
      <fieldset className="space-y-2">
        <legend className={labelClass}>How you pay</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <PayMethod
            checked={method === "lightning"}
            onSelect={() => setMethod("lightning")}
            title="Bitcoin"
            badge="10% off"
            hint="Lightning. Works now."
          />
          <PayMethod
            checked={method === "card"}
            onSelect={() => setMethod("card")}
            title="Card"
            hint="Visa, Mastercard, or similar."
          />
        </div>
      </fieldset>
      {method === "lightning" ? <LightningCredits mock={mock} /> : <CardCredits />}
    </div>
  )
}

function PayMethod({
  checked,
  onSelect,
  title,
  badge,
  hint,
}: {
  checked: boolean
  onSelect: () => void
  title: string
  badge?: string
  hint: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={checked}
      className={`rounded-2xl border px-4 py-3 text-left transition ${
        checked ? "border-2 border-accent bg-tint" : "border-line bg-card hover:border-accent/50"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="font-semibold">{title}</span>
        {badge ? (
          <span className="rounded-full bg-hl px-2 py-0.5 text-xs font-semibold text-ink">{badge}</span>
        ) : null}
      </span>
      <span className="mt-1 block text-sm text-muted">{hint}</span>
    </button>
  )
}

function LightningCredits({ mock }: { mock: boolean }) {
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
      <p className="text-sm text-muted">Pay with Bitcoin and keep the 10% off. Same credit, lower price.</p>
      <form action={action} className="space-y-4">
        <label className="space-y-1.5">
          <span className={labelClass}>Credit pack</span>
          <select className={inputClass} name="amountSats" defaultValue="1000">
            {CREDIT_PACKS.map((pack) => (
              <option key={pack} value={String(pack)}>
                {pack.toLocaleString("en-US")} credit · {formatSats(pack)}
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
            <p className="mt-2 text-muted">Demo payment. You can mark it paid to try the flow.</p>
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

function CardCredits() {
  const [pack, setPack] = useState(1000)
  const [message, setMessage] = useState("")
  const listPrice = cardListPriceSats(pack)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Card is the full price. Bitcoin is 10% off — {formatUsd(pack)} instead of {formatUsd(listPrice)} for this pack.
      </p>
      <label className="space-y-1.5">
        <span className={labelClass}>Credit pack</span>
        <select
          className={inputClass}
          value={String(pack)}
          onChange={(event) => {
            setPack(Number(event.target.value))
            setMessage("")
          }}
        >
          {CREDIT_PACKS.map((row) => (
            <option key={row} value={String(row)}>
              {row.toLocaleString("en-US")} credit · pay {formatUsd(cardListPriceSats(row))}
            </option>
          ))}
        </select>
      </label>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          setMessage(
            "Card checkout is listed so companies can pay normally. It is not live yet, so no charge and no credit. Switch to Bitcoin to pay now and keep the 10% off.",
          )
        }}
      >
        <label className="space-y-1.5">
          <span className={labelClass}>Name on card</span>
          <input className={inputClass} autoComplete="cc-name" placeholder="Name on the card" />
        </label>
        <label className="space-y-1.5">
          <span className={labelClass}>Card number</span>
          <input className={inputClass} inputMode="numeric" autoComplete="cc-number" placeholder="ACCT-000015" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className={labelClass}>Expiry</span>
            <input className={inputClass} autoComplete="cc-exp" placeholder="MM / YY" />
          </label>
          <label className="space-y-1.5">
            <span className={labelClass}>CVC</span>
            <input className={inputClass} inputMode="numeric" autoComplete="cc-csc" placeholder="123" />
          </label>
        </div>
        {message ? <p className="text-sm text-muted">{message}</p> : null}
        <button className={btnPrimary} type="submit">
          Pay {formatUsd(listPrice)} by card
        </button>
      </form>
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
