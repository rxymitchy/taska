import { requireRole } from "@/lib/session"

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["WORKER"])
  return children
}
