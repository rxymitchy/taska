import type { PayoutStatus } from "@prisma/client"
import { SatsAmount } from "@/components/ui"

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
    <p className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted">{who}</span>
      {amountSats ? <SatsAmount sats={amountSats} size="sm" /> : null}
      <span className="text-muted">· {labels[status]}</span>
    </p>
  )
}
