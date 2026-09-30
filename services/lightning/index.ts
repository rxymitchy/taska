import { MockLightningProvider } from "./mock-provider"
import { invoiceForDestination } from "./lnurl"
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
 * The rest of the app talks to LightningService, not to a specific node.
 * LIGHTNING_PROVIDER=mock (the default) uses MockLightningProvider. Those
 * invoices start with lnmock1 and do not move bitcoin.
 * Set OPENNODE_API_KEY, or LIGHTNING_PROVIDER=opennode, to create real invoices
 * and pay Lightning addresses. Keys stay in server environment variables.
 * Never import this module from client code.
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
  if (name === "opennode") {
    return new LightningService(new OpenNodeLightningProvider())
  }
  throw new Error(
    `Unknown LIGHTNING_PROVIDER "${name}". Use mock or opennode.`,
  )
}
