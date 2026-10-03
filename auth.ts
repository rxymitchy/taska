import { compare } from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "@/auth.config"
import { ensureBootstrapAdmin } from "@/lib/bootstrap-admin"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

// Bracket access keeps AUTH_SECRET at runtime. Vercel "Sensitive" secrets are
// not available at build, so process.env.AUTH_SECRET would be baked in as empty.
function authSecret() {
  const env = process.env
  const name = ["AUTH", "SECRET"].join("_")
  const alt = ["NEXTAUTH", "SECRET"].join("_")
  return env[name] || env[alt]
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: authSecret(),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase()
        const password = String(credentials?.password ?? "")
        if (!email || password.length < 8) return null
        await ensureBootstrapAdmin()
        const limit = rateLimit(`login:${email}`, 10, 15 * 60 * 1000)
        if (!limit.ok) return null
        const user = await Promise.race([
          prisma.user.findUnique({ where: { email } }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 10_000)),
        ])
        if (!user) return null
        const valid = await compare(password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, email: user.email, role: user.role }
      },
    }),
  ],
})
