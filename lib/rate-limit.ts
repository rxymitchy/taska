type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const current = buckets.get(key)
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true as const }
  }
  if (current.count >= limit) {
    return { ok: false as const, retryAt: current.resetAt }
  }
  current.count += 1
  return { ok: true as const }
}
