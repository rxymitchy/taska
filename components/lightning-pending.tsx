import type { PayoutStatus } from "@prisma/client"
import { formatSats } from "@/lib/money"

const labels: Record<PayoutStatus, string> = {
  PENDING: "Pending",
  SENT: "Sent",
  FAILED: "Failed",
}

export function LightningPending({
  who,
  status = "PENDING",
  amountSats,
}: {
  who: string
  status?: PayoutStatus
  amountSats?: number
}) {
  return (
    <p className="flex flex-wrap items-center gap-1.5 rounded-md border border-line bg-card px-3 py-2 text-sm">
      {who}
      {amountSats ? <><span aria-hidden="true">·</span><span className="inline-flex rounded-md bg-hl px-2 py-0.5 font-semibold tabular-nums text-ink">{formatSats(amountSats)}</span></> : ""}
      <span>— {labels[status]}</span>
    </p>
  )
}
