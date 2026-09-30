import { MockLightningProvider } from "./mock-provider"
import { invoiceForDestination } from "./lnurl"
import { NwcLightningProvider } from "./nwc-provider"
import { OpenNodeLightningProvider } from "./opennode-provider"
import type {
  CreateInvoiceInput,
  LightningProvider,
  PayInvoiceInput,
} from "./types"
import { lightningProviderName } from "@/lib/pricing"

/**
 * Payment rail for Taska.
 *
 * Default is mock (`lnmock1`, no bitcoin) unless a wallet is connected:
 * NWC_URL (Alby Hub / Nostr Wallet Connect) or OPENNODE_API_KEY.
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
  const name = lightningProviderName()
  if (name === "mock") {
    return new LightningService(new MockLightningProvider())
  }
  if (name === "nwc") {
    return new LightningService(new NwcLightningProvider())
  }
  if (name === "opennode") {
    return new LightningService(new OpenNodeLightningProvider())
  }
  throw new Error(
    `Unknown LIGHTNING_PROVIDER "${name}". Use mock, nwc, or opennode.`,
  )
}
