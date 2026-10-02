"use client"

import { useState, type ReactNode } from "react"
import { CopyInvoiceButton } from "@/components/copy-invoice-button"
import { InvoiceQr } from "@/components/invoice-qr"
import { btnSecondary } from "@/lib/styles"

export function PendingInvoiceActions({
  invoice,
  confirm,
}: {
  invoice: string
  confirm: ReactNode
}) {
  const [showQr, setShowQr] = useState(false)

  return (
    <div className="flex flex-col items-end gap-3">
      {showQr ? <InvoiceQr invoice={invoice} size={140} /> : null}
      <span className="flex flex-wrap items-center justify-end gap-2">
        <button className={btnSecondary} type="button" onClick={() => setShowQr((open) => !open)}>
          {showQr ? "Hide QR" : "Show QR"}
        </button>
        <CopyInvoiceButton invoice={invoice} />
        {confirm}
      </span>
    </div>
  )
}
