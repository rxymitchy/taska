import { ensureBootstrapAdmin } from "@/lib/bootstrap-admin"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureBootstrapAdmin()
  return children
}
