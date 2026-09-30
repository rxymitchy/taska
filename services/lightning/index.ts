import { MockLightningProvider } from "./mock-provider"
import { invoiceForDestination } from "./lnurl"
import { NwcLightningProvider } from "./nwc-provider"
import type {
  CreateInvoiceInput,
  LightningProvider,
  PayInvoiceInput,
} from "./types"
import { lightningProviderName } from "@/lib/pricing"

/**
 * Payment rail for Taska: Alby Hub (NWC) when NWC_URL is set, otherwise mock.
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

  getPaymentStatus(paymentHash: string) {
    return this.provider.getPaymentStatus(paymentHash)
  }

  getBalance() {
    return this.provider.getBalance()
  }
}

export function getLightningService() {
  if (lightningProviderName() === "nwc") {
    return new LightningService(new NwcLightningProvider())
  }
  return new LightningService(new MockLightningProvider())
}
