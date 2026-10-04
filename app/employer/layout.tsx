import { LiveRefresh } from "@/components/live-refresh"
import { requireRole } from "@/lib/session"

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["EMPLOYER"])
  return (
    <>
      <LiveRefresh href="/api/employer/status" />
      {children}
    </>
  )
}
