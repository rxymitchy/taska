import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ensureBootstrapAdmin } from "@/lib/bootstrap-admin"
import { canAdmin, canReview } from "@/lib/staff"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureBootstrapAdmin()
  const session = await auth()
  if (session?.user && canReview(session.user) && !canAdmin(session.user)) {
    redirect("/reviewer")
  }
  return children
}
