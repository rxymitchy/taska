/**
 * Live Lightning rail: Breez SDK Spark.
 * Creates company invoices and pays speaker/reviewer destinations.
 * The seed stays in BREEZ_MNEMONIC. Never import this module from client code.
 */
import { createHash, randomUUID } from "crypto"
import { mkdir } from "fs/promises"
import { join } from "path"
import { breezApiKey, breezMnemonic, breezNetwork } from "@/lib/pricing"
import type {
  CreateInvoiceInput,
  Invoice,
  LightningProvider,
  PayInvoiceInput,
  PaymentResult,
} from "./types"

type BreezModule = typeof import("@breeztech/breez-sdk-spark/nodejs")
type BreezSdk = Awaited<ReturnType<BreezModule["connect"]>>
type BreezPayment = Awaited<ReturnType<BreezSdk["getPayment"]>>["payment"]

/** One SDK instance per server process. Cold starts reconnect from the mnemonic. */
let sdkPromise: Promise<BreezSdk> | null = null

function asPaid(status: string | undefined): PaymentResult["status"] {
  const value = (status ?? "").toLowerCase()
  if (value === "completed" || value === "succeeded" || value === "paid") return "PAID"
  if (value === "failed" || value === "expired") return "FAILED"
  return "PENDING"
}

function paymentId(payment: BreezPayment | undefined) {
  return payment?.id ?? ""
}

function paymentHashOf(payment: BreezPayment | undefined) {
  const details = payment?.details as { type?: string; invoice?: string; paymentHash?: string; htlcDetails?: { paymentHash?: string } } | undefined
  if (details?.type === "lightning") {
    return details.htlcDetails?.paymentHash || details.paymentHash || ""
  }
  return ""
}

function invoiceOf(payment: BreezPayment | undefined) {
  const details = payment?.details as { type?: string; invoice?: string; paymentRequest?: string } | undefined
  if (details?.type === "lightning") return details.invoice || details.paymentRequest || ""
  return ""
}

function amountOf(payment: BreezPayment | undefined) {
  if (!payment) return 0
  const raw = payment as { amount?: unknown; amountSats?: unknown }
  const value = Number(raw.amountSats ?? raw.amount ?? 0)
  return Number.isFinite(value) ? value : 0
}

function sameInvoice(left: string, right: string) {
  const a = left.trim().toLowerCase()
  const b = right.trim().toLowerCase()
  return Boolean(a && b && a === b)
}

function paymentMatches(
  payment: BreezPayment | undefined,
  paymentHash: string,
  invoice?: string,
  amountSats?: number,
) {
  if (!payment) return false
  const hashHit =
    Boolean(paymentHash) &&
    (paymentHashOf(payment) === paymentHash || paymentId(payment) === paymentHash)
  const invoiceHit = Boolean(invoice) && sameInvoice(invoiceOf(payment), invoice || "")
  if (!hashHit && !invoiceHit) return false
  if (amountSats && amountSats > 0) {
    const paid = amountOf(payment)
    if (paid > 0 && paid !== amountSats) return false
  }
  return true
}

function fromPayment(payment: BreezPayment | undefined, fallbackHash: string): PaymentResult {
  return {
    paymentHash: paymentHashOf(payment) || paymentId(payment) || fallbackHash,
    status: asPaid(payment?.status),
    feeSats: payment ? Number(payment.fees) : undefined,
    amountSats: amountOf(payment) || undefined,
  }
}

function postgresUrl() {
  const named = (process.env.BREEZ_DATABASE_URL || "").trim()
  if (named) return named
  return ""
}

function fileStorageDir() {
  const named = (process.env.BREEZ_STORAGE_DIR || "").trim()
  if (named) return named
  // Vercel’s disk is ephemeral; Spark restores the wallet from the mnemonic.
  if (process.env.VERCEL) return "/tmp/breez"
  return join(process.cwd(), ".data", "breez")
}

async function loadBreez(): Promise<BreezModule> {
  return import("@breeztech/breez-sdk-spark/nodejs")
}

async function connectBreez() {
  const apiKey = breezApiKey()
  const mnemonic = breezMnemonic()
  if (!apiKey || !mnemonic) {
    throw new Error("BREEZ_API_KEY and BREEZ_MNEMONIC must be set for live Lightning.")
  }

  const breez = await loadBreez()
  const network = breezNetwork()
  // Server config turns off background sync. Call syncWallet before reading the till.
  const config = process.env.VERCEL ? breez.defaultServerConfig(network) : breez.defaultConfig(network)
  config.apiKey = apiKey

  const seed = { type: "mnemonic" as const, mnemonic, passphrase: undefined }
  const storageDir = fileStorageDir()
  await mkdir(storageDir, { recursive: true })
  try {
    return await breez.connect({ config, seed, storageDir })
  } catch (fileError) {
    // Neon’s pooled URL breaks Breez advisory locks; prefer a direct URL if falling back.
    const url =
      postgresUrl() ||
      (process.env.DIRECT_URL || process.env.DATABASE_URL || "").replace("-pooler.", ".").trim()
    if (!url) throw fileError
    const pgConfig = breez.defaultPostgresStorageConfig(url)
    pgConfig.maxPoolSize = 2
    return breez.SdkBuilder.new(config, seed).withStorageBackend(breez.postgresStorage(pgConfig)).build()
  }
}

async function getSdk() {
  if (!sdkPromise) {
    sdkPromise = connectBreez().catch((error) => {
      sdkPromise = null
      throw error
    })
  }
  return sdkPromise
}

async function paymentHashFromInvoice(sdk: BreezSdk, invoice: string) {
  try {
    const parsed = await sdk.parse(invoice)
    if (parsed.type === "bolt11Invoice") return parsed.paymentHash
  } catch {
    // Fall through to a stable local id so the deposit row can still be stored.
  }
  return createHash("sha256").update(invoice).digest("hex")
}

async function findPayment(sdk: BreezSdk, paymentHash: string, invoice?: string, amountSats?: number) {
  await sdk.syncWallet({})
  try {
    const found = await sdk.getPayment({ paymentId: paymentHash })
    if (paymentMatches(found.payment, paymentHash, invoice, amountSats)) return found.payment
  } catch {
    // Not a Breez payment id — search recent payments by hash or invoice.
  }

  const listed = await sdk.listPayments({ offset: 0, limit: 200 })
  return listed.payments.find((payment) => paymentMatches(payment, paymentHash, invoice, amountSats))
}

export class BreezLightningProvider implements LightningProvider {
  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    if (!Number.isInteger(input.amountSats) || input.amountSats <= 0) {
      throw new Error("Invoice amount must be a positive number of sats")
    }
    const sdk = await getSdk()
    const received = await sdk.receivePayment({
      paymentMethod: {
        type: "bolt11Invoice",
        description: input.memo.slice(0, 100),
        amountSats: input.amountSats,
        expirySecs: 3600,
        paymentHash: undefined,
        receiverIdentityPublicKey: undefined,
      },
    })
    const invoice = received.paymentRequest
    if (!invoice) throw new Error("Breez did not return an invoice.")
    const paymentHash = await paymentHashFromInvoice(sdk, invoice)
    return { invoice, paymentHash, amountSats: input.amountSats }
  }

  async payInvoice(input: PayInvoiceInput): Promise<PaymentResult> {
    const sdk = await getSdk()
    const prepareResponse = await sdk.prepareSendPayment({
      paymentRequest: { type: "input", input: input.invoice },
      amount: undefined,
      tokenIdentifier: undefined,
      conversionOptions: undefined,
      feePolicy: undefined,
    })
    const options =
      prepareResponse.paymentMethod.type === "bolt11Invoice"
        ? { type: "bolt11Invoice" as const, preferSpark: false, completionTimeoutSecs: 30 }
        : undefined
    const sent = await sdk.sendPayment({
      prepareResponse,
      options,
      idempotencyKey: randomUUID(),
    })
    return fromPayment(sent.payment, paymentHashOf(sent.payment) || sent.payment.id)
  }

  async getPaymentStatus(paymentHash: string, invoice?: string, amountSats?: number): Promise<PaymentResult> {
    const sdk = await getSdk()
    const payment = await findPayment(sdk, paymentHash, invoice, amountSats)
    if (!payment) return { paymentHash, status: "PENDING" }
    return fromPayment(payment, paymentHash)
  }

  async getBalance() {
    const sdk = await getSdk()
    await sdk.syncWallet({})
    // ensureSynced is rejected when background tasks are off (Vercel server config).
    const info = await sdk.getInfo({ ensureSynced: false })
    return { balanceSats: Number(info.balanceSats ?? 0) }
  }
}
