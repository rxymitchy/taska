export type LightningPaymentState = "PENDING" | "PAID" | "FAILED"

export type CreateInvoiceInput = {
  amountSats: number
  memo: string
  destination?: string
}

export type Invoice = {
  invoice: string
  paymentHash: string
  amountSats: number
  checkoutUrl?: string
}

export type PayInvoiceInput = {
  invoice: string
  amountSats: number
}

export type PaymentResult = {
  paymentHash: string
  status: LightningPaymentState
  feeSats?: number
  amountSats?: number
}

/** Swap mock for Breez in `getLightningService()`. Do not import this from the browser. */
export interface LightningProvider {
  createInvoice(input: CreateInvoiceInput): Promise<Invoice>
  payInvoice(input: PayInvoiceInput): Promise<PaymentResult>
  getPaymentStatus(paymentHash: string, invoice?: string, amountSats?: number): Promise<PaymentResult>
  getBalance(): Promise<{ balanceSats: number }>
}
