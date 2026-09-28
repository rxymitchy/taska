import { avatarColor, initials } from "@/lib/format"

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
  return <div className={`mx-auto w-full max-w-6xl px-4 ${className}`}>{children}</div>
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

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "bg-good/10 text-good",
    FUNDED: "bg-good/10 text-good",
    SENT: "bg-good/10 text-good",
    PAID: "bg-good/10 text-good",
    PENDING: "bg-warn/10 text-warn",
    REJECTED: "bg-bad/10 text-bad",
    FAILED: "bg-bad/10 text-bad",
    CLOSED: "bg-black/5 text-muted",
  }
  const label = status.charAt(0) + status.slice(1).toLowerCase()
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-black/5 text-muted"}`}>
      {label}
    </span>
  )
}
