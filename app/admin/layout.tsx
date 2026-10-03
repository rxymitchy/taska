import { requireUser } from "@/lib/session"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireUser()
  return children
}
