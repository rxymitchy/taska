import type { Role } from "@prisma/client"
import { brand } from "@/lib/brand"

function envValue(...parts: string[]) {
  return process.env[parts.join("_")]
}

function siteUrl() {
  return (envValue("AUTH", "URL") || "http://localhost:3000").replace(/\/$/, "")
}

async function sendMail(input: { to: string; subject: string; text: string }) {
  if (input.to.endsWith("@taska.demo")) return false

  const key = envValue("RESEND", "API", "KEY")
  const from = envValue("EMAIL", "FROM") || "Taska <onboarding@resend.dev>"
  if (!key) {
    console.warn("Email skipped: RESEND_API_KEY is missing.")
    return false
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      console.error("Email failed.", res.status, await res.text())
      return false
    }
    return true
  } catch (error) {
    console.error("Email failed.", error)
    return false
  } finally {
    clearTimeout(timer)
  }
}

function signupCopy(name: string, role: Role) {
  const login = `${siteUrl()}/login`
  const greeting = `Hi ${name},`
  const body =
    role === "EMPLOYER"
      ? "Your company account is ready. You can send answers for people to check."
      : role === "ADMIN"
        ? "Your reviewer account is ready. You double-check the work — and get paid."
        : "Your account is ready. You check answers in your language — and get paid."

  return {
    subject: "You're signed up for Taska",
    text: [
      greeting,
      "",
      body,
      "",
      `Log in here: ${login}`,
      "",
      "This email confirms you signed up. If that was not you, you can ignore it.",
      "",
      brand.footer,
    ].join("\n"),
  }
}

export async function sendSignupConfirmation(input: {
  to: string
  name: string
  role: Role
}) {
  const { subject, text } = signupCopy(input.name, input.role)
  await sendMail({ to: input.to, subject, text })
}

export async function sendPasswordResetEmail(input: {
  to: string
  name: string
  resetUrl: string
}) {
  const text = [
    `Hi ${input.name},`,
    "",
    "Use this link to choose a new password:",
    input.resetUrl,
    "",
    "This link expires in one hour. If you did not ask for this, you can ignore the email.",
    "",
    brand.footer,
  ].join("\n")

  return sendMail({
    to: input.to,
    subject: "Reset your Taska password",
    text,
  })
}
