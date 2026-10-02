export function evaluatorPayoutSats() {
  return Math.max(1, Number(process.env.EVALUATOR_PAYOUT_SATS || 500))
}

export function reviewerPayoutSats() {
  return Math.max(1, Number(process.env.REVIEWER_PAYOUT_SATS || 400))
}

export function platformFeeBps() {
  return Math.max(0, Number(process.env.PLATFORM_FEE_BPS || 200))
}

export function laborSats() {
  return evaluatorPayoutSats() + reviewerPayoutSats()
}

export function companyCostPerEvaluation() {
  const labor = laborSats()
  return labor + Math.ceil((labor * platformFeeBps()) / 10_000)
}

export const MAX_UPLOAD_ROWS = 200

function envValue(...parts: string[]) {
  return process.env[parts.join("_")]
}

/** Breez emails a one-line cert. PEM headers make the SDK fail to decode it. */
export function breezApiKey() {
  const raw = (envValue("BREEZ", "API", "KEY") || "").trim().replace(/\\n/g, "\n")
  if (!raw) return ""
  return raw
    .replace(/-----BEGIN [A-Z ]+-----/g, "")
    .replace(/-----END [A-Z ]+-----/g, "")
    .replace(/\s+/g, "")
}

export function breezMnemonic() {
  return (envValue("BREEZ", "MNEMONIC") || "").trim()
}

export function breezNetwork(): "mainnet" | "regtest" | "signet" {
  const value = (envValue("BREEZ", "NETWORK") || "mainnet").trim().toLowerCase()
  if (value === "regtest" || value === "signet") return value
  return "mainnet"
}

/** Health and payouts treat both secrets as required before real bitcoin can move. */
export function lightningProviderName(): "breez" | "mock" {
  if (breezApiKey() && breezMnemonic()) return "breez"
  return "mock"
}
