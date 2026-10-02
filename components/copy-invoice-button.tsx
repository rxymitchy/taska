"use client"

import { useState } from "react"
import { btnSecondary } from "@/lib/styles"

export function CopyInvoiceButton({ invoice }: { invoice: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(invoice)
    } catch {
      const field = document.createElement("textarea")
      field.value = invoice
      field.setAttribute("readonly", "")
      field.style.position = "fixed"
      field.style.left = "-9999px"
      document.body.appendChild(field)
      field.select()
      document.execCommand("copy")
      document.body.removeChild(field)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button className={btnSecondary} type="button" onClick={copy}>
      {copied ? "Copied" : "Copy invoice"}
    </button>
  )
}
