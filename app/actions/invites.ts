"use server"

import { revalidatePath } from "next/cache"
import { newInviteToken, hashInviteToken } from "@/lib/invites"
import { prisma } from "@/lib/prisma"
import { isDemoAccountEmail } from "@/lib/demo-accounts"
import { requireAdmin, requireReviewer } from "@/lib/session"
import { sendReviewerInviteEmail } from "@/lib/mail"
import { parseStaffKind, staffFlags } from "@/lib/staff"
import { destinationSchema } from "@/lib/validators"

export type InviteState = { error: string; inviteUrl?: string; emailed?: boolean; promoted?: boolean }

export async function inviteReviewer(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const user = await requireAdmin()
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  const kind = parseStaffKind(formData.get("staffKind"))
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return { error: "Enter a valid email." }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (isDemoAccountEmail(email)) return { error: "That is a seed account. Invite a real person." }
  if (existing?.isAdmin && existing.isReviewer && kind === "both") {
    return { error: "That person already has both roles." }
  }
  if (existing) {
    const flags = staffFlags(kind)
    const keepAccount = existing.role === "WORKER" || existing.role === "EMPLOYER"
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        isAdmin: flags.isAdmin || existing.isAdmin,
        isReviewer: flags.isReviewer || existing.isReviewer,
        role: keepAccount && existing.role === "EMPLOYER" ? "EMPLOYER" : flags.isAdmin ? "ADMIN" : flags.isReviewer && existing.role === "WORKER" ? "REVIEWER" : existing.role,
      },
    })
    revalidatePath("/admin")
    revalidatePath("/admin/invite")
    revalidatePath("/admin/people")
    revalidatePath("/dashboard")
    return { error: "", promoted: true }
  }

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
      staffKind: kind,
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
  const user = await requireReviewer()
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

export async function promoteEvaluatorToReviewer(formData: FormData) {
  await requireAdmin()
  const userId = String(formData.get("userId") ?? "")
  const kind = parseStaffKind(formData.get("staffKind"))
  const evaluator = await prisma.user.findFirst({
    where: { id: userId, role: "WORKER" },
  })
  if (!evaluator || isDemoAccountEmail(evaluator.email)) return
  const flags = staffFlags(kind)
  await prisma.user.update({
    where: { id: evaluator.id },
    data: {
      role: flags.isAdmin ? "ADMIN" : "REVIEWER",
      isAdmin: flags.isAdmin,
      isReviewer: flags.isReviewer,
    },
  })
  revalidatePath("/admin")
  revalidatePath("/admin/invite")
  revalidatePath("/admin/people")
  revalidatePath("/dashboard")
}
