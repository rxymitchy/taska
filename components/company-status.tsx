import { companyStatus } from "@/lib/company-status"
import { StatusPill } from "@/components/ui"

export function CompanyStatus({ status }: { status: string }) {
  const view = companyStatus(status)
  return <StatusPill status={view.status} label={view.label} />
}
