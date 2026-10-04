import type { Role } from "@prisma/client"
import { isDemoAccountEmail, isLiveSite } from "@/lib/demo-accounts"

export type StaffKind = "reviewer" | "admin" | "both"

export type StaffUser = {
  id: string
  email?: string | null
  role: Role
  isAdmin?: boolean
  isReviewer?: boolean
}

export function canAdmin(user: StaffUser) {
  if (user.email && isDemoAccountEmail(user.email) && isLiveSite()) return false
  return Boolean(user.isAdmin || user.role === "ADMIN")
}

export function canReview(user: StaffUser) {
  if (user.email && isDemoAccountEmail(user.email) && isLiveSite()) return false
  return Boolean(user.isReviewer || user.role === "REVIEWER" || user.role === "ADMIN")
}

export function staffFlags(kind: StaffKind) {
  if (kind === "both") return { isAdmin: true, isReviewer: true, role: "ADMIN" as const }
  if (kind === "admin") return { isAdmin: true, isReviewer: false, role: "ADMIN" as const }
  return { isAdmin: false, isReviewer: true, role: "REVIEWER" as const }
}

export function parseStaffKind(value: FormDataEntryValue | null): StaffKind {
  if (value === "admin" || value === "both" || value === "reviewer") return value
  return "reviewer"
}

export function homeForUser(user: StaffUser) {
  if (canAdmin(user)) return "/admin"
  if (canReview(user)) return "/reviewer"
  if (user.role === "EMPLOYER") return "/employer"
  return "/dashboard"
}

export function staffLabel(user: StaffUser) {
  if (canAdmin(user) && canReview(user)) return "Admin and reviewer"
  if (canAdmin(user)) return "Admin"
  if (canReview(user)) return "Reviewer"
  if (user.role === "EMPLOYER") return "Company"
  return "Evaluator"
}
