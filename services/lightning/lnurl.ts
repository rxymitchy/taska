import type { LightningProvider } from "./types"
import { usesLiveLightning } from "@/lib/payout-destination"

const LNURL_TIMEOUT_MS = 12_000

export function isBolt11(value: string) {
  return /^(lnbc|lntb|lnbcrt|lnmock)/i.test(value.trim())
}

export function isLightningAddress(value: string) {
  return /^[a-zA-Z0-9._~+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim())
}

async function fetchJson(url: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LNURL_TIMEOUT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } })
    if (!response.ok) throw new Error(`LNURL request failed (${response.status})`)
    return (await response.json()) as Record<string, unknown>
  } finally {
    clearTimeout(timer)
  }
}

export async function lnurlPayInvoice(address: string, amountSats: number, memo: string) {
  const trimmed = address.trim()
  const at = trimmed.lastIndexOf("@")
  const name = encodeURIComponent(trimmed.slice(0, at))
  const domain = trimmed.slice(at + 1)
  const first = await fetchJson(`https://${domain}/.well-known/lnurlp/${name}`)
  const callback = String(first.callback ?? "")
  if (!callback.startsWith("https://")) throw new Error("Lightning address did not return a pay callback.")
  const min = Number(first.minSendable ?? 0) / 1000
  const max = Number(first.maxSendable ?? amountSats * 1000) / 1000
  if (amountSats < min || amountSats > max) {
    throw new Error(`That Lightning address only accepts ${min}–${max} sats.`)
  }
  const amountMsats = amountSats * 1000
  const separator = callback.includes("?") ? "&" : "?"
  const comment = Number(first.commentAllowed ?? 0) > 0 ? `&comment=${encodeURIComponent(memo.slice(0, Number(first.commentAllowed)))}` : ""
  const second = await fetchJson(`${callback}${separator}amount=${amountMsats}${comment}`)
  const invoice = String(second.pr ?? "")
  if (!isBolt11(invoice)) throw new Error("Lightning address did not return an invoice.")
  return invoice
}

export async function invoiceForDestination(
  destination: string,
  amountSats: number,
  memo: string,
  provider: LightningProvider,
) {
  const dest = destination.trim()
  if (isBolt11(dest)) return dest
  if (isLightningAddress(dest) && usesLiveLightning()) {
    return lnurlPayInvoice(dest, amountSats, memo)
  }
  const created = await provider.createInvoice({ amountSats, memo, destination: dest })
  return created.invoice
}
