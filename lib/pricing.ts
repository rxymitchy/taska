export function evaluatorPayoutSats() {
  return Math.max(1, Number(process.env.EVALUATOR_PAYOUT_SATS || 500))
}

export function reviewerPayoutSats() {
  return Math.max(1, Number(process.env.REVIEWER_PAYOUT_SATS || 200))
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

export function lightningProviderName() {
  return process.env.LIGHTNING_PROVIDER || (process.env.OPENNODE_API_KEY ? "opennode" : "mock")
}
