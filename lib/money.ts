const BTC_USD = Number(
  process.env.NEXT_PUBLIC_BTC_USD_PRICE || process.env.BTC_USD_PRICE || 65000,
)

export function satsToUsd(sats: number) {
  return (sats / 100_000_000) * BTC_USD
}

export function formatSats(sats: number) {
  const formatted = Math.trunc(sats)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return `${formatted} sats`
}

export function formatUsd(sats: number) {
  return satsToUsd(sats).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
}
