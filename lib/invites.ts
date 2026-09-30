import { createHash, randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export function newInviteToken() {
  return randomBytes(32).toString("hex")
}

export async function findOpenInvite(token: string) {
  const tokenHash = hashInviteToken(token)
  const invite = await prisma.reviewerInvite.findUnique({ where: { tokenHash } })
  if (!invite || invite.usedAt || invite.expiresAt.getTime() < Date.now()) return null
  return invite
}
