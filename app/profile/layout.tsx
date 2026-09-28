import { requireRole } from "@/lib/session"

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["WORKER"])
  return children
}
