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
    <p className="rounded-md border border-line bg-card px-3 py-2 text-sm">
      {who}
      {amountSats ? ` · ${formatSats(amountSats)}` : ""} — {labels[status]}
    </p>
  )
}
