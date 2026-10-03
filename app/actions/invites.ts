"use server"

import { revalidatePath } from "next/cache"
import { newInviteToken, hashInviteToken } from "@/lib/invites"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { sendReviewerInviteEmail } from "@/lib/mail"
import { destinationSchema } from "@/lib/validators"

export type InviteState = { error: string; inviteUrl?: string; emailed?: boolean }

export async function inviteReviewer(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const user = await requireRole(["ADMIN"])
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return { error: "Enter a valid email." }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing?.role === "ADMIN") return { error: "That person is already a reviewer." }
  if (existing) return { error: "That email already has an account." }

  const open = await prisma.reviewerInvite.findFirst({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
  })
  if (open) {
    return { error: "An unused invite is already open for that email. Send a new one after it expires." }
  }

  const token = newInviteToken()
  await prisma.reviewerInvite.create({
    data: {
      email,
      tokenHash: hashInviteToken(token),
      invitedByUserId: user.id,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  })

  const origin = (process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "")
  const inviteUrl = `${origin}/signup?invite=${token}`
  const emailed = await sendReviewerInviteEmail({ to: email, inviteUrl })
  revalidatePath("/admin/invite")
  return {
    error: "",
    inviteUrl,
    emailed,
  }
}

export async function saveReviewerLightning(_prev: { error: string }, formData: FormData) {
  const user = await requireRole(["ADMIN"])
  const parsed = destinationSchema.safeParse(formData.get("lightningAddress") ?? "")
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Enter a Lightning address." }

  await prisma.user.update({
    where: { id: user.id },
    data: { lightningAddress: parsed.data || null },
  })
  revalidatePath("/admin")
  revalidatePath("/admin/invite")
  return { error: "" }
}
