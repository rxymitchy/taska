import type {
  CreateInvoiceInput,
  Invoice,
  LightningProvider,
  PayInvoiceInput,
  PaymentResult,
} from "./types"

function apiBase() {
  return (process.env.OPENNODE_API_BASE || "https://api.opennode.com").replace(/\/$/, "")
}

async function opennode(path: string, init?: RequestInit) {
  const key = process.env.OPENNODE_API_KEY
  if (!key) throw new Error("OPENNODE_API_KEY is missing")
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: key,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  })
  const body = (await response.json().catch(() => ({}))) as {
    message?: string
    data?: Record<string, unknown>
  }
  if (!response.ok) {
    throw new Error(body.message || `OpenNode request failed (${response.status})`)
  }
  return body.data ?? {}
}

function asPaid(status: string | undefined): PaymentResult["status"] {
  const value = (status ?? "").toLowerCase()
  if (value === "paid" || value === "confirmed" || value === "completed") return "PAID"
  if (value === "failed" || value === "expired" || value === "rejected" || value === "refunded") return "FAILED"
  return "PENDING"
}

export class OpenNodeLightningProvider implements LightningProvider {
  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    if (!Number.isInteger(input.amountSats) || input.amountSats <= 0) {
      throw new Error("Invoice amount must be a positive number of sats")
    }
    const callback = process.env.AUTH_URL ? `${process.env.AUTH_URL.replace(/\/$/, "")}/api/lightning/webhook` : undefined
    const data = await opennode("/v1/charges", {
      method: "POST",
      body: JSON.stringify({
        amount: input.amountSats,
        description: input.memo.slice(0, 100),
        callback_url: callback,
        auto_settle: true,
      }),
    })
    const lightning = (data.lightning_invoice ?? {}) as { payreq?: string }
    const invoice = String(lightning.payreq ?? "")
    const paymentHash = String(data.id ?? "")
    if (!invoice || !paymentHash) throw new Error("OpenNode did not return an invoice.")
    return {
      invoice,
      paymentHash,
      amountSats: input.amountSats,
      checkoutUrl: String(data.hosted_checkout_url ?? ""),
    }
  }

  async payInvoice(input: PayInvoiceInput): Promise<PaymentResult> {
    const data = await opennode("/v2/withdrawals", {
      method: "POST",
      body: JSON.stringify({
        type: "ln",
        amount: input.amountSats,
        address: input.invoice,
      }),
    })
    const paymentHash = String(data.id ?? "")
    const status = asPaid(String(data.status ?? "pending"))
    return { paymentHash, status: status === "PENDING" ? "PAID" : status, feeSats: Number(data.fee ?? 0) || 0 }
  }

  async getPaymentStatus(paymentHash: string): Promise<PaymentResult> {
    try {
      const charge = await opennode(`/v1/charge/${paymentHash}`)
      return { paymentHash, status: asPaid(String(charge.status ?? "")) }
    } catch {
      try {
        const withdrawal = await opennode(`/v1/withdrawal/${paymentHash}`)
        const status = asPaid(String(withdrawal.status ?? ""))
        return { paymentHash, status: status === "PENDING" ? "PAID" : status }
      } catch {
        return { paymentHash, status: "PENDING" }
      }
    }
  }

  async getBalance() {
    const data = await opennode("/v1/account/balance")
    const btc = (data.balance as { BTC?: number } | undefined)?.BTC
    return { balanceSats: Number(btc ?? data.BTC ?? 0) }
  }
}
