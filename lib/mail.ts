import type { Role } from "@prisma/client"
import { brand } from "@/lib/brand"

function envValue(...parts: string[]) {
  return process.env[parts.join("_")]
}

function siteUrl() {
  return (envValue("AUTH", "URL") || "http://localhost:3000").replace(/\/$/, "")
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
  if (input.to.endsWith("@taska.demo")) return

  const key = envValue("RESEND", "API", "KEY")
  const from = envValue("EMAIL", "FROM") || "Taska <onboarding@resend.dev>"
  if (!key) {
    console.warn("Signup confirmation email skipped: RESEND_API_KEY is missing.")
    return
  }

  const { subject, text } = signupCopy(input.name, input.role)
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
        subject,
        text,
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      console.error("Signup confirmation email failed.", res.status, await res.text())
    }
  } catch (error) {
    console.error("Signup confirmation email failed.", error)
  } finally {
    clearTimeout(timer)
  }
}
