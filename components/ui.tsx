import type { ReactNode } from "react"
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
      <span className={`font-semibold tabular-nums text-ink ${size === "lg" ? "font-display text-3xl tracking-tight" : "text-sm"}`}>
        {prefix}
        {formatSats(sats)}
      </span>
      <span className={`mt-1 font-semibold text-good ${size === "lg" ? "text-sm" : "text-xs"}`}>{formatUsd(sats)}</span>
    </span>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] tracking-tight">{title}</h1>
        {description ? <p className="mt-2 text-[15px] leading-relaxed text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function StatCard({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="rounded-[24px] border border-[#12382b]/10 bg-[#fbf7ee] px-5 py-5">
      <p className="text-[13px] text-muted">{label}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-[24px] border border-[#12382b]/10 bg-[#fbf7ee] ${className}`}>{children}</div>
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-display text-xl tracking-tight">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
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
  return <div className={`mx-auto w-full max-w-6xl px-5 lg:px-12 ${className}`}>{children}</div>
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[24px] border border-[#12382b]/10 bg-[#fbf7ee] px-5 py-5">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-3 font-display text-3xl tracking-tight text-ink">{value}</p>
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
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "border border-line bg-paper text-muted"}`}>
      {text}
    </span>
  )
}
