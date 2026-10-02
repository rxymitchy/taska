// Shared Taska look: Lagoon Green tokens with soft edges and quiet shadows.
// Server-safe on purpose (no "use client", no hooks) so server and client components can both import it.
import type { ReactNode } from "react"

const base =
  "inline-flex items-center justify-center gap-2 rounded-md border border-line font-bold shadow-[0_14px_28px_-12px_rgba(15,42,32,.18)] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60"
const lg = "h-[52px] px-5 text-base"
const sm = "h-11 px-4 text-sm"

export const kit = {
  card: "rounded-lg border border-line bg-card p-5 text-ink shadow-[0_30px_60px_-30px_rgba(15,42,32,.25)]",
  input:
    "h-12 w-full rounded-md border border-line bg-card px-4 text-base text-ink placeholder:text-muted focus:border-2 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15",
  label: "block text-[13px] font-bold text-ink",
  hint: "block text-xs font-medium text-muted",
  btn: `${base} ${lg} bg-accent text-white hover:bg-ink`,
  btnSm: `${base} ${sm} bg-accent text-white hover:bg-ink`,
  btnWhite: `${base} ${lg} bg-card text-ink hover:bg-tint`,
  btnYellow: `${base} ${lg} bg-accent text-white`,
  btnCoral: `${base} ${lg} bg-bad text-white`,
  btnBlack: `${base} ${lg} bg-ink text-white`,
  nav: "inline-flex h-11 items-center rounded-md px-4 text-sm font-bold text-ink transition-colors hover:bg-tint focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15",
  error: "rounded-md border border-bad/20 bg-bad/10 px-4 py-2.5 text-sm font-bold text-bad",
  ok: "rounded-md border border-good/20 bg-tint px-4 py-2.5 text-sm font-bold text-good",
  tile: "grid min-w-9 place-items-center rounded-md border border-line bg-card px-2 py-1.5 text-3xl font-bold text-ink",
}

const burst =
  "polygon(50% 0%,61% 14%,79% 9%,82% 28%,100% 35%,88% 50%,100% 65%,82% 72%,79% 91%,61% 86%,50% 100%,39% 86%,21% 91%,18% 72%,0% 65%,12% 50%,0% 35%,18% 28%,21% 9%,39% 14%)"

export function Starburst({
  children,
  color = "var(--accent)",
  className = "size-20 text-sm",
}: {
  children: ReactNode
  color?: string
  className?: string
}) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center text-center font-extrabold leading-none text-black ${className}`}
      style={{ backgroundColor: color, clipPath: burst }}
    >
      {children}
    </span>
  )
}