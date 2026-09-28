"use server"

import { hash } from "bcryptjs"
import { AuthError } from "next-auth"
import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import { homeForRole } from "@/lib/session"
import { rateLimit } from "@/lib/rate-limit"
import { signupSchema } from "@/lib/validators"

export type AuthState = { error: string }

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
  const user = await prisma.user.findUnique({ where: { email } })
  const redirectTo = safeCallback(formData.get("callbackUrl")) ?? (user ? homeForRole(user.role) : "/dashboard")
  const result = await signInWithPassword(email, password, redirectTo)
  return result ?? { error: "" }
}

export async function loginDemo(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (process.env.DEMO_LOGIN !== "true") {
    return { error: "Demo login is turned off." }
  }
  const role = String(formData.get("role") ?? "worker")
  const email =
    role === "employer"
      ? "employer@taska.demo"
      : role === "admin"
        ? "admin@taska.demo"
        : "worker@taska.demo"
  const password = process.env.DEMO_PASSWORD || "demo1234"
  const redirectTo = role === "employer" ? "/employer" : role === "admin" ? "/admin" : "/dashboard"
  const result = await signInWithPassword(email, password, redirectTo)
  return result ?? { error: "" }
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
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

  const result = await signInWithPassword(email, parsed.data.password, homeForRole(user.role))
  return result ?? { error: "" }
}
