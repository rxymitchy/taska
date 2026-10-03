import { btnSecondary } from "@/lib/styles"

export function DownloadReceiptButton({ depositId }: { depositId: string }) {
  return (
    <a className={btnSecondary} href={`/api/employer/credits/${depositId}/receipt`}>
      Download receipt
    </a>
  )
}
