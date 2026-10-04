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
    <p className="flex flex-wrap items-center gap-1.5 rounded-md border border-line bg-card px-3 py-2 text-sm">
      {who}
      {amountSats ? (
        <>
          <span aria-hidden="true">·</span>
          <SatsAmount sats={amountSats} size="sm" />
        </>
      ) : null}
      <span>— {labels[status]}</span>
    </p>
  )
}
