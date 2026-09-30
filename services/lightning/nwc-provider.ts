import { NWCClient } from "@getalby/sdk/nwc"
import { nwcConnectionUrl } from "@/lib/pricing"
import type {
  CreateInvoiceInput,
  Invoice,
  LightningProvider,
  PayInvoiceInput,
  PaymentResult,
} from "./types"

function client() {
  const url = nwcConnectionUrl()
  if (!url) throw new Error("NWC_URL is missing. Connect an Alby Hub (or other NWC wallet) in server env.")
  return new NWCClient({ nostrWalletConnectUrl: url })
}

function asPaid(row: { settled_at?: number; preimage?: string; state?: string }): PaymentResult["status"] {
  if (row.state === "settled") return "PAID"
  if (row.state === "failed") return "FAILED"
  if (row.preimage) return "PAID"
  if (row.settled_at && row.settled_at > 0) return "PAID"
  return "PENDING"
}

/**
 * Live Lightning through Nostr Wallet Connect (Alby Hub or any NWC wallet).
 * The connection string stays in server env. Taska never stores the wallet seed.
 * Company invoices are created on that wallet. Payouts are paid from it.
 */
export class NwcLightningProvider implements LightningProvider {
  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    if (!Number.isInteger(input.amountSats) || input.amountSats <= 0) {
      throw new Error("Invoice amount must be a positive number of sats")
    }
    const nwc = client()
    try {
      const created = await nwc.makeInvoice({
        amount: input.amountSats * 1000,
        description: input.memo.slice(0, 120),
      })
      const invoice = String(created.invoice ?? "")
      const paymentHash = String(created.payment_hash ?? "")
      if (!invoice || !paymentHash) throw new Error("Wallet did not return a Lightning invoice.")
      return { invoice, paymentHash, amountSats: input.amountSats }
    } finally {
      nwc.close()
    }
  }

  async payInvoice(input: PayInvoiceInput): Promise<PaymentResult> {
    const nwc = client()
    try {
      const paid = await nwc.payInvoice({ invoice: input.invoice })
      return {
        paymentHash: paid.preimage,
        status: "PAID",
        feeSats: Math.floor(Number(paid.fees_paid ?? 0) / 1000),
      }
    } finally {
      nwc.close()
    }
  }

  async getPaymentStatus(paymentHash: string): Promise<PaymentResult> {
    const nwc = client()
    try {
      const found = await nwc.lookupInvoice({ payment_hash: paymentHash })
      return { paymentHash, status: asPaid(found), feeSats: Number(found.fees_paid ?? 0) || 0 }
    } catch {
      return { paymentHash, status: "PENDING" }
    } finally {
      nwc.close()
    }
  }

  async getBalance() {
    const nwc = client()
    try {
      const result = await nwc.getBalance()
      return { balanceSats: Math.floor(Number(result.balance ?? 0) / 1000) }
    } finally {
      nwc.close()
    }
  }
}
