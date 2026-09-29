export function LightningPending({ who }: { who: string }) {
  return (
    <p className="rounded-md border border-line bg-card px-3 py-2 text-sm">
      {who} payment: Lightning — Pending
    </p>
  )
}
