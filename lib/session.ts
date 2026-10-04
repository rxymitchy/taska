import type { Role } from "@prisma/client"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { canInviteReviewer, canReview, freshStaffUser } from "@/lib/reviewer-access"
import { canAdmin, homeForUser } from "@/lib/staff"

export async function requireUser(loginPath = "/login") {
  const session = await auth()
  if (!session?.user) redirect(loginPath)
  return session.user
}

export function homeForRole(role: Role) {
  if (role === "EMPLOYER") return "/employer"
  if (role === "ADMIN" || role === "REVIEWER") return "/admin"
  return "/dashboard"
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser()
  if (!roles.includes(user.role)) redirect(homeForRole(user.role))
  return user
}

export async function requireReviewer() {
  const user = await requireUser("/admin/login")
  if (!(await canReview(user))) redirect(homeForUser(user))
  return user
}

export async function requireAdmin() {
  const user = await requireUser("/admin/login")
  const fresh = (await freshStaffUser(user.id)) ?? user
  if (!canAdmin(fresh)) redirect(homeForUser(fresh))
  return fresh
}

export async function requireCanInvite() {
  const user = await requireUser("/admin/login")
  if (!(await canInviteReviewer(user))) redirect(homeForUser(user))
  return user
}
