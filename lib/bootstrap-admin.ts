import { hash } from "bcryptjs"
import { retireDemoAccounts } from "@/lib/demo-accounts"
import { prisma } from "@/lib/prisma"

const BOOTSTRAP_EMAIL = "lolitia15@gmail.com"

export function bootstrapAdminEmail() {
  return (process.env.ADMIN_BOOTSTRAP_EMAIL || BOOTSTRAP_EMAIL).trim().toLowerCase()
}

export function bootstrapAdminPassword() {
  return process.env.ADMIN_BOOTSTRAP_PASSWORD || "testing@123"
}

let ensured = false

/** Makes sure the first admin account exists so /admin is reachable. */
export async function ensureBootstrapAdmin() {
  if (ensured) return
  await retireDemoAccounts()
  const email = bootstrapAdminEmail()
  const password = bootstrapAdminPassword()
  if (!email || password.length < 8) return

  const existing = await prisma.user.findUnique({ where: { email } })
  const passwordHash = await hash(password, 10)
  if (!existing) {
    await prisma.user.create({
      data: { email, passwordHash, role: "ADMIN" },
    })
  } else {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "ADMIN", passwordHash },
    })
  }
  ensured = true
}
