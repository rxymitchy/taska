import type { Role } from "@prisma/client"
import { isDemoAccountEmail } from "@/lib/demo-accounts"
import { canAdmin, canReview as staffCanReview } from "@/lib/staff"
import { prisma } from "@/lib/prisma"

export { isDemoAccountEmail }

export function foundingReviewerEmails() {
  return (process.env.FOUNDING_REVIEWER_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

export function isFoundingReviewer(email: string | null | undefined) {
  if (!email) return false
  return foundingReviewerEmails().includes(email.trim().toLowerCase())
}

export async function hasRealReviewer() {
  const staff = await prisma.user.findMany({
    where: { OR: [{ isReviewer: true }, { role: "REVIEWER" }] },
    select: { email: true },
  })
  return staff.some((row) => !isDemoAccountEmail(row.email))
}

export async function freshStaffUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, isAdmin: true, isReviewer: true },
  })
}

export async function freshReviewRole(userId: string) {
  return freshStaffUser(userId)
}

export async function canReview(user: {
  id: string
  email?: string | null
  role: Role
  isAdmin?: boolean
  isReviewer?: boolean
}) {
  const fresh = (await freshStaffUser(user.id)) ?? user
  if (isFoundingReviewer(fresh.email)) return true
  return staffCanReview(fresh)
}

export async function canInviteReviewer(user: {
  id: string
  email?: string | null
  role: Role
  isAdmin?: boolean
  isReviewer?: boolean
}) {
  const fresh = (await freshStaffUser(user.id)) ?? user
  return canAdmin(fresh)
}
