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

export async function canReview(user: { email?: string | null; role: Role }) {
  if (user.role === "ADMIN") return true
  if (user.role === "EMPLOYER") return true
  if (isFoundingReviewer(user.email)) return true
  if (await hasRealReviewer()) return false
  return user.role === "WORKER"
}

export async function canInviteReviewer(user: { email?: string | null; role: Role }) {
  if (user.role === "ADMIN" || user.role === "WORKER" || user.role === "EMPLOYER") return true
  return isFoundingReviewer(user.email)
}
