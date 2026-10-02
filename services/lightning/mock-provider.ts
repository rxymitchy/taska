import { randomBytes } from "crypto"
import type {
  CreateInvoiceInput,
  Invoice,
  LightningProvider,
  PayInvoiceInput,
  PaymentResult,
} from "./types"

/**
 * Sandbox provider for local demos and tests.
 * Invoices are not valid BOLT11 and cannot move real bitcoin.
 * Used when BREEZ_API_KEY or BREEZ_MNEMONIC is missing.
 */
export class MockLightningProvider implements LightningProvider {
  private invoices = new Map<string, Invoice>()
  private payments = new Map<string, PaymentResult>()

  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    if (!Number.isInteger(input.amountSats) || input.amountSats <= 0) {
      throw new Error("Invoice amount must be a positive number of sats")
    }
    const paymentHash = randomBytes(32).toString("hex")
    const invoice = `lnmock1${input.amountSats}s${paymentHash}`
    const created = { invoice, paymentHash, amountSats: input.amountSats }
    this.invoices.set(invoice, created)
    return created
  }

  async payInvoice(input: PayInvoiceInput): Promise<PaymentResult> {
    const known = this.invoices.get(input.invoice)
    if (!input.invoice.startsWith("ln") || (known && known.amountSats !== input.amountSats)) {
      return { paymentHash: known?.paymentHash ?? "", status: "FAILED" }
    }
    const paymentHash = known?.paymentHash ?? randomBytes(32).toString("hex")
    const result: PaymentResult = { paymentHash, status: "PAID", feeSats: 0 }
    this.payments.set(paymentHash, result)
    return result
  }

  async getPaymentStatus(paymentHash: string): Promise<PaymentResult> {
    return this.payments.get(paymentHash) ?? { paymentHash, status: "PENDING" }
  }

  async getBalance() {
    // MOCK_LIGHTNING_BALANCE_SATS is only the number this sandbox reports.
    const balanceSats = Number(process.env.MOCK_LIGHTNING_BALANCE_SATS || 2_000_000)
    return { balanceSats }
  }
}
