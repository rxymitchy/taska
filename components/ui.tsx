import { avatarColor, initials } from "@/lib/format"
import { formatSats, formatUsd } from "@/lib/money"

export function SatsAmount({
  sats,
  size = "lg",
  prefix = "",
}: {
  sats: number
  size?: "lg" | "sm"
  prefix?: string
}) {
  return (
    <span className="inline-flex flex-col">
      <span
        className={`inline-flex w-fit rounded-md bg-hl px-2 font-semibold tabular-nums text-ink ${
          size === "lg" ? "py-1 font-display text-2xl" : "py-0.5 text-sm"
        }`}
      >
        {prefix}
        {formatSats(sats)}
      </span>
      <span className={`mt-1 font-semibold text-good ${size === "lg" ? "text-sm" : "text-xs"}`}>{formatUsd(sats)}</span>
    </span>
  )
}

export function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const dimension = size === "lg" ? "size-16 text-lg" : "size-11 text-sm"
  return (
    <span
      className={`inline-flex ${dimension} shrink-0 items-center justify-center rounded-full font-semibold text-white`}
      style={{ backgroundColor: avatarColor(name) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}

export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`mx-auto w-full max-w-7xl px-5 lg:px-16 ${className}`}>{children}</div>
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-line bg-card px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  )
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const styles: Record<string, string> = {
    APPROVED: "border border-good/20 bg-tint text-good",
    COMPLETED: "border border-good/20 bg-tint text-good",
    FUNDED: "border border-good/20 bg-tint text-good",
    SENT: "border border-good/20 bg-tint text-good",
    PAID: "border border-good/20 bg-tint text-good",
    PENDING: "border border-warn/20 bg-warn/10 text-warn",
    ASSIGNED: "border border-good/20 bg-tint text-good",
    WORKER_COMPLETED: "border border-warn/20 bg-warn/10 text-warn",
    UNDER_REVIEW: "border border-warn/20 bg-warn/10 text-warn",
    REJECTED: "border border-bad/50 bg-card text-bad",
    FAILED: "border border-bad/50 bg-card text-bad",
    CLOSED: "border border-line bg-paper text-muted",
  }
  const labels: Record<string, string> = {
    PENDING: "Pending",
    ASSIGNED: "Assigned",
    WORKER_COMPLETED: "Worker completed",
    UNDER_REVIEW: "Under review",
    APPROVED: "Approved",
    COMPLETED: "Validated",
    REJECTED: "Rejected",
  }
  const text = label ?? labels[status] ?? status.charAt(0) + status.slice(1).toLowerCase()
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] ?? "border border-line bg-paper text-muted"}`}>
      {text}
    </span>
  )
}
