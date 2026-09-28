import { MockLightningProvider } from "./mock-provider"
import type {
  CreateInvoiceInput,
  LightningProvider,
  PayInvoiceInput,
} from "./types"

/**
 * Payment rail for Taska.
 *
 * The rest of the app talks to LightningService, not to a specific node.
 * LIGHTNING_PROVIDER=mock uses MockLightningProvider.
 * Add a real provider by implementing LightningProvider and branching below.
 * Keys stay in server environment variables. Never import this module from client code.
 */
export class LightningService {
  constructor(private readonly provider: LightningProvider) {}

  createInvoice(input: CreateInvoiceInput) {
    return this.provider.createInvoice(input)
  }

  payInvoice(input: PayInvoiceInput) {
    return this.provider.payInvoice(input)
  }

  getPaymentStatus(paymentHash: string) {
    return this.provider.getPaymentStatus(paymentHash)
  }

  getBalance() {
    return this.provider.getBalance()
  }
}

export function getLightningService() {
  const name = process.env.LIGHTNING_PROVIDER || "mock"
  if (name === "mock") {
    return new LightningService(new MockLightningProvider())
  }
  throw new Error(
    `Unknown LIGHTNING_PROVIDER "${name}". Implement it in services/lightning/index.ts.`,
  )
}
