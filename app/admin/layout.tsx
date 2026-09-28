import { requireRole } from "@/lib/session"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["ADMIN"])
  return children
}
