import { compare } from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
        const limit = rateLimit(`login:${email}`, 10, 15 * 60 * 1000)
        if (!limit.ok) return null
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        const valid = await compare(password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, email: user.email, role: user.role }
      },
    }),
  ],
})
