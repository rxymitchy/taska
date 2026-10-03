import { formatSats } from "@/lib/money"

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;"
    if (char === "<") return "&lt;"
    if (char === ">") return "&gt;"
    if (char === '"') return "&quot;"
    return "&#39;"
  })
}

function formatWhen(value: Date | null | undefined) {
  if (!value) return "—"
  return value.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }) + " UTC"
}

export function creditReceiptFilename(depositId: string) {
  return `taska-receipt-${depositId.slice(0, 8)}.html`
}

export function renderCreditReceipt(input: {
  companyName: string
  amountSats: number
  status: string
  invoice: string
  paymentHash: string
  createdAt: Date
  paidAt: Date | null
  receiptId: string
}) {
  const amount = formatSats(input.amountSats)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Taska receipt ${escapeHtml(amount)}</title>
  <style>
    body { margin: 0; font-family: Georgia, "Times New Roman", serif; color: #0a1a12; background: #f6f1e6; }
    main { max-width: 40rem; margin: 2.5rem auto; padding: 2rem; background: #fffdf6; border: 1px solid #d7d0c0; }
    p { margin: 0.4rem 0; line-height: 1.45; }
    h1 { margin: 0 0 0.25rem; font-size: 1.75rem; }
    .muted { color: #5c675f; }
    .row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.65rem 0; border-top: 1px solid #ece6d8; }
    .hash { word-break: break-all; font-family: ui-monospace, Consolas, monospace; font-size: 0.8rem; }
    .amount { font-size: 1.35rem; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <p class="muted">Taska</p>
    <h1>Payment receipt</h1>
    <p class="muted">Company credit for African-language evaluation work.</p>
    <div class="row"><span>Company</span><strong>${escapeHtml(input.companyName)}</strong></div>
    <div class="row"><span>Amount</span><span class="amount">${escapeHtml(amount)}</span></div>
    <div class="row"><span>Status</span><strong>${escapeHtml(input.status)}</strong></div>
    <div class="row"><span>Paid</span><span>${escapeHtml(formatWhen(input.paidAt))}</span></div>
    <div class="row"><span>Invoice created</span><span>${escapeHtml(formatWhen(input.createdAt))}</span></div>
    <div class="row"><span>Receipt</span><span>${escapeHtml(input.receiptId)}</span></div>
    <div class="row"><span>Payment reference</span><span class="hash">${escapeHtml(input.paymentHash)}</span></div>
    <p class="muted" style="margin-top:1.25rem">Lightning invoice</p>
    <p class="hash">${escapeHtml(input.invoice)}</p>
  </main>
</body>
</html>`
}
