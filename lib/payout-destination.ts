import { lightningProviderName } from "@/lib/pricing"

/** Seed/demo addresses. Fine for mock. Live Breez must not pay these. */
export function isPlaceholderLightningAddress(value: string) {
  return /@(taska\.demo|demo\.taska)$/i.test(value.trim())
}

/** True only when Breez secrets are present. Mock still pays @taska.demo. */
export function usesLiveLightning() {
  return lightningProviderName() === "breez"
}

export function payableLightningDestination(value: string | null | undefined) {
  const destination = value?.trim() ?? ""
  if (!destination) return null
  if (usesLiveLightning() && isPlaceholderLightningAddress(destination)) return null
  return destination
}
