"use server"

import { compare, hash } from "bcryptjs"
import { AuthError } from "next-auth"
import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import { canReview } from "@/lib/reviewer-access"
import { canAdmin, homeForUser, parseStaffKind, staffFlags } from "@/lib/staff"
import { rateLimit } from "@/lib/rate-limit"
import { signupSchema, inviteSignupSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validators"
import { findOpenInvite, hashInviteToken } from "@/lib/invites"
import { findOpenReset, hashResetToken, newResetToken } from "@/lib/password-reset"
import { sendPasswordResetEmail, sendSignupConfirmation } from "@/lib/mail"
import { ensureBootstrapAdmin } from "@/lib/bootstrap-admin"
import { isDemoAccountEmail, isDemoLoginBlocked } from "@/lib/demo-accounts"

export type AuthState = { error: string; sent?: boolean }

function safeCallback(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null
  if (!value.startsWith("/") || value.startsWith("//")) return null
  return value
}

async function signInWithPassword(email: string, password: string, redirectTo: string) {
  try {
    await signIn("credentials", { email, password, redirectTo })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email or password is incorrect." }
    }
    throw error
  }
  return { error: "" }
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") ?? "")
  if (isDemoLoginBlocked(email)) return { error: "Email or password is incorrect." }
  const user = await prisma.user.findUnique({ where: { email } })
  const redirectTo = safeCallback(formData.get("callbackUrl")) ?? (user ? homeForUser(user) : "/dashboard")
  const result = await signInWithPassword(email, password, redirectTo)
  return result ?? { error: "" }
}

export async function loginAdmin(_prev: AuthState, formData: FormData): Promise<AuthState> {
  await ensureBootstrapAdmin()
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") ?? "")
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: "Email or password is incorrect." }
  const valid = await compare(password, user.passwordHash)
  if (!valid || !canAdmin(user)) {
    return { error: "Email or password is incorrect." }
  }
  const callback = safeCallback(formData.get("callbackUrl"))
  const redirectTo = callback?.startsWith("/admin") ? callback : "/admin"
  const result = await signInWithPassword(email, password, redirectTo)
  return result ?? { error: "" }
}

export async function loginReviewer(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase()
  const password = String(formData.get("password") ?? "")
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: "Email or password is incorrect." }
  const valid = await compare(password, user.passwordHash)
  if (!valid || !(await canReview(user))) {
    return { error: "Email or password is incorrect." }
  }
  const callback = safeCallback(formData.get("callbackUrl"))
  const home = homeForUser(user)
  const redirectTo = callback?.startsWith("/reviewer") || callback?.startsWith("/admin") ? callback : home
  const result = await signInWithPassword(email, password, redirectTo)
  return result ?? { error: "" }
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const inviteToken = String(formData.get("invite") ?? "")
  if (inviteToken) return signupReviewer(formData)

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    country: formData.get("country") || undefined,
    companyName: formData.get("companyName") || undefined,
  })
  if (!parsed.success) {
    return { error: "Check your name, email, and password (8 or more characters)." }
  }
  const email = parsed.data.email.toLowerCase()
  if (isDemoAccountEmail(email)) return { error: "Use a real email address." }
  const limit = rateLimit(`signup:${email}`, 5, 60 * 60 * 1000)
  if (!limit.ok) return { error: "Too many attempts. Try again later." }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "An account with that email already exists." }

  if (parsed.data.role === "WORKER" && !parsed.data.country) {
    return { error: "Choose a country." }
  }
  if (parsed.data.role === "EMPLOYER" && !parsed.data.companyName) {
    return { error: "Enter a company name." }
  }

  const passwordHash = await hash(parsed.data.password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: parsed.data.role,
      workerProfile:
        parsed.data.role === "WORKER"
          ? {
              create: {
                name: parsed.data.name,
                country: parsed.data.country ?? "Kenya",
                skills: [],
                languages: [],
              },
            }
          : undefined,
      employerProfile:
        parsed.data.role === "EMPLOYER"
          ? {
              create: {
                companyName: parsed.data.companyName ?? parsed.data.name,
              },
            }
          : undefined,
    },
  })

  await sendSignupConfirmation({
    to: email,
    name: parsed.data.name,
    role: user.role,
  })
  const result = await signInWithPassword(email, parsed.data.password, homeForUser(user))
  return result ?? { error: "" }
}

async function signupReviewer(formData: FormData): Promise<AuthState> {
  const parsed = inviteSignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    invite: formData.get("invite"),
    lightningAddress: formData.get("lightningAddress") || undefined,
  })
  if (!parsed.success) {
    return { error: "Check your name, email, and password (8 or more characters)." }
  }

  const invite = await findOpenInvite(parsed.data.invite)
  if (!invite) return { error: "This invite is invalid or has expired." }

  const email = parsed.data.email.toLowerCase()
  if (isDemoAccountEmail(email)) return { error: "Use a real email address." }
  if (email !== invite.email) return { error: "Use the email this invite was sent to." }

  const limit = rateLimit(`signup:${email}`, 5, 60 * 60 * 1000)
  if (!limit.ok) return { error: "Too many attempts. Try again later." }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: "An account with that email already exists." }

  const passwordHash = await hash(parsed.data.password, 10)
  const flags = staffFlags(parseStaffKind(invite.staffKind))
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: flags.role,
      isAdmin: flags.isAdmin,
      isReviewer: flags.isReviewer,
      lightningAddress: parsed.data.lightningAddress || null,
    },
  })
  await prisma.reviewerInvite.updateMany({
    where: { tokenHash: hashInviteToken(parsed.data.invite), usedAt: null },
    data: { usedAt: new Date() },
  })

  await sendSignupConfirmation({
    to: email,
    name: parsed.data.name,
    role: user.role,
  })
  const result = await signInWithPassword(email, parsed.data.password, homeForUser(user))
  return result ?? { error: "" }
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") })
  if (!parsed.success) return { error: "Enter a valid email." }

  const email = parsed.data.email.toLowerCase()
  const limit = rateLimit(`reset:${email}`, 5, 60 * 60 * 1000)
  if (!limit.ok) return { error: "Too many attempts. Try again later." }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { workerProfile: true, employerProfile: true },
  })
  if (user) {
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    })
    const token = newResetToken()
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash: hashResetToken(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    })
    const origin = (process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "")
    const name = user.workerProfile?.name || user.employerProfile?.companyName || "there"
    await sendPasswordResetEmail({
      to: email,
      name,
      resetUrl: `${origin}/reset-password?token=${token}`,
    })
  }

  return { error: "", sent: true }
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the new password (8 or more characters)." }
  }

  const reset = await findOpenReset(parsed.data.token)
  if (!reset) return { error: "This link is invalid or has expired. Ask for a new one." }

  const passwordHash = await hash(parsed.data.password, 10)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
  ])

  const result = await signInWithPassword(reset.user.email, parsed.data.password, homeForUser(reset.user))
  return result ?? { error: "" }
}
