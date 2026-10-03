import type { Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export function isDemoAccountEmail(email: string) {
  return /@(taska\.demo|demo\.taska)$/i.test(email.trim())
}

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

/** A reviewer who signed up for real — not the seed admin@taska.demo account. */
export async function hasRealReviewer() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  })
  return admins.some((admin) => !isDemoAccountEmail(admin.email))
}

export async function freshReviewRole(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  })
}

export async function canReview(user: { id: string; email?: string | null; role: Role }) {
  const fresh = (await freshReviewRole(user.id)) ?? user
  if (fresh.role === "ADMIN") return true
  return isFoundingReviewer(fresh.email)
}

export async function canInviteReviewer(user: { id: string; email?: string | null; role: Role }) {
  return canReview(user)
}
