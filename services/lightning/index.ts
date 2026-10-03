import { BreezLightningProvider } from "./breez-provider"
import { MockLightningProvider } from "./mock-provider"
import { invoiceForDestination } from "./lnurl"
import type {
  CreateInvoiceInput,
  LightningProvider,
  PayInvoiceInput,
} from "./types"
import { lightningProviderName } from "@/lib/pricing"

/**
 * Payment rail for Taska: Breez when BREEZ_API_KEY and BREEZ_MNEMONIC are set, otherwise mock.
 * Secrets stay in server environment variables. Never import from client code.
 */
export class LightningService {
  constructor(private readonly provider: LightningProvider) {}

  createInvoice(input: CreateInvoiceInput) {
    return this.provider.createInvoice(input)
  }

  payInvoice(input: PayInvoiceInput) {
    return this.provider.payInvoice(input)
  }

  async payDestination(destination: string, amountSats: number, memo: string) {
    const invoice = await invoiceForDestination(destination, amountSats, memo, this.provider)
    const paid = await this.provider.payInvoice({ invoice, amountSats })
    return { ...paid, invoice }
  }

  getPaymentStatus(paymentHash: string, invoice?: string) {
    return this.provider.getPaymentStatus(paymentHash, invoice)
  }

  getBalance() {
    return this.provider.getBalance()
  }
}

export function getLightningService() {
  if (lightningProviderName() === "breez") {
    return new LightningService(new BreezLightningProvider())
  }
  return new LightningService(new MockLightningProvider())
}
