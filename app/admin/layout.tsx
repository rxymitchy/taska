import { ensureBootstrapAdmin } from "@/lib/bootstrap-admin"
import { requireUser } from "@/lib/session"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureBootstrapAdmin()
  await requireUser()
  return children
}
