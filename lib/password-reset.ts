import { createHash, randomBytes } from "crypto"
import { prisma } from "@/lib/prisma"

export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export function newResetToken() {
  return randomBytes(32).toString("hex")
}

export async function findOpenReset(token: string) {
  const tokenHash = hashResetToken(token)
  const reset = await prisma.passwordReset.findUnique({
    where: { tokenHash },
    include: { user: true },
  })
  if (!reset || reset.usedAt || reset.expiresAt.getTime() < Date.now()) return null
  return reset
}
