import type { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export async function requireUser() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  return session.user
}

export function homeForRole(role: Role) {
  if (role === "EMPLOYER") return "/employer"
  if (role === "ADMIN") return "/admin"
  return "/dashboard"
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser()
  if (!roles.includes(user.role)) redirect(homeForRole(user.role))
  return user
}
